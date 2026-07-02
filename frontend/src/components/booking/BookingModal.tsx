'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { io, Socket } from 'socket.io-client';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
}

export function BookingModal({ isOpen, onClose, doctor }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedHour, setSelectedHour] = React.useState<string | null>(null);
  const [symptoms, setSymptoms] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [alternativeSuggestion, setAlternativeSuggestion] = React.useState<string | null>(null);
  
  // Realtime slots locking
  const [lockedSlots, setLockedSlots] = React.useState<Set<string>>(new Set());
  const socketRef = React.useRef<Socket | null>(null);

  // Helper to get next 7 days
  const nextDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Init socket and join room when modal opens or date changes
  React.useEffect(() => {
    if (!isOpen || !doctor) return;

    // Connect socket
    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { doctorId: doctor._id, date: selectedDate });
    });

    socket.on('sync_locks', ({ lockedHours }) => {
      setLockedSlots(new Set(lockedHours));
    });

    socket.on('slot_locked', ({ hour }) => {
      setLockedSlots(prev => {
        const newSet = new Set(prev);
        newSet.add(hour);
        return newSet;
      });
      // If the slot we currently selected was locked by someone else
      if (selectedHour === hour) {
        setSelectedHour(null);
        setError('Slot bạn chọn vừa bị người khác giữ. Vui lòng chọn slot khác.');
      }
    });

    socket.on('slot_unlocked', ({ hour }) => {
      setLockedSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(hour);
        return newSet;
      });
    });

    socket.on('lock_failed', ({ hour, message }) => {
      setError(message);
      setSelectedHour(null);
    });

    return () => {
      socket.emit('leave_room', { doctorId: doctor._id, date: selectedDate });
      socket.disconnect();
    };
  }, [isOpen, doctor, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHourSelect = (hourBlock: string) => {
    if (lockedSlots.has(hourBlock)) return; // prevent clicking locked slots
    
    // Unlock previous if any
    if (selectedHour && socketRef.current) {
      socketRef.current.emit('unlock_slot', { doctorId: doctor._id, date: selectedDate, hour: selectedHour });
    }

    setSelectedHour(hourBlock);
    setError('');
    setAlternativeSuggestion(null);

    // Request lock for new
    if (socketRef.current) {
      socketRef.current.emit('lock_slot', { doctorId: doctor._id, date: selectedDate, hour: hourBlock });
    }
  };

  const handleBook = async () => {
    if (!selectedHour || !symptoms.trim()) {
      setError('Vui lòng chọn giờ và nhập triệu chứng');
      return;
    }

    setIsLoading(true);
    setError('');
    setAlternativeSuggestion(null);

    const startHourStr = selectedHour.split('-')[0]; // "08:00"
    // ISO format requires YYYY-MM-DDTHH:mm:ss. startHourStr is "HH:mm".
    const datetime = new Date(`${selectedDate}T${startHourStr}:00`);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: doctor._id,
          clinicId: doctor.clinicId._id || doctor.clinicId,
          datetime: datetime.toISOString(),
          symptoms
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        setError(data.message);
        if (data.alternativeSlot) {
          const altDate = new Date(data.alternativeSlot);
          const formatted = `${altDate.toLocaleDateString('vi-VN')} lúc ${altDate.getHours()}:00`;
          setAlternativeSuggestion(formatted);
        }
        return;
      }

      if (!res.ok) throw new Error(data.message || 'Đặt lịch thất bại');

      // Success, server should unlock the slot and make it officially booked in DB
      // Note: Full feature would broadcast DB change via socket to mark it booked forever
      if (socketRef.current) {
         socketRef.current.emit('unlock_slot', { doctorId: doctor._id, date: selectedDate, hour: selectedHour });
      }

      alert('Đặt lịch thành công!');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (selectedHour && socketRef.current) {
          socketRef.current.emit('unlock_slot', { doctorId: doctor._id, date: selectedDate, hour: selectedHour });
        }
        onClose();
      }}
      title={`Đặt lịch với ${doctor.name}`}
      description={doctor.specialty}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text mb-2 block">Chọn ngày</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {nextDays.map(date => {
              const d = new Date(date);
              const label = `${d.getDate()}/${d.getMonth() + 1}`;
              return (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setSelectedHour(null); setError(''); setAlternativeSuggestion(null); setLockedSlots(new Set()); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    selectedDate === date 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-surface border-surface/50 text-text hover:border-primary/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text mb-2 block">Chọn giờ (Block 1 tiếng)</label>
          <div className="grid grid-cols-3 gap-2">
            {doctor.workingHours.map((hourBlock: string) => {
              const startHour = parseInt(hourBlock.split('-')[0], 10);
              const slotTime = new Date(`${selectedDate}T${startHour.toString().padStart(2, '0')}:00:00`).getTime();
              const isPast = slotTime < new Date().getTime();
              
              const isSelected = selectedHour === hourBlock;
              const isLocked = lockedSlots.has(hourBlock);

              return (
                <div key={hourBlock} className="relative">
                  <button
                    disabled={isPast || isLocked}
                    onClick={() => handleHourSelect(hourBlock)}
                    className={`w-full py-2 rounded-xl border text-sm font-medium transition-all ${
                      isPast 
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' 
                        : isLocked && !isSelected
                          ? 'border-yellow-300 bg-yellow-50 text-yellow-700 cursor-not-allowed opacity-70'
                          : isSelected
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                            : 'border-surface/50 hover:border-primary/50 text-text bg-white'
                    }`}
                  >
                    {hourBlock}
                  </button>
                  {isLocked && !isSelected && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 animate-pulse text-[8px]" title="Đang có người giữ">
                      ⏳
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text mb-2 block">Triệu chứng của bạn</label>
          <textarea
            className="w-full rounded-xl border border-surface/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            rows={3}
            placeholder="Mô tả ngắn gọn triệu chứng..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl text-sm border border-rose-200">
            <p className="font-semibold mb-1">{error}</p>
            {alternativeSuggestion && (
              <p className="mt-2 text-text">
                💡 Bạn có muốn đặt lịch vào <strong className="text-primary">{alternativeSuggestion}</strong> không?
              </p>
            )}
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleBook} 
          isLoading={isLoading}
          disabled={!selectedHour}
        >
          Xác nhận đặt lịch
        </Button>
      </div>
    </Modal>
  );
}
