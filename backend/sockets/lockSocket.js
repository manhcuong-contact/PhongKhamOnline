// Structure: 
// activeLocks = Map<roomName, Map<hourBlock, { socketId, timeoutId }>>
// roomName format: `${doctorId}_${date}` (date format: YYYY-MM-DD)

const activeLocks = new Map();
const LOCK_TTL = 2 * 60 * 1000; // 2 minutes

export const initSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join room for a specific doctor & date
    socket.on('join_room', ({ doctorId, date }) => {
      const roomName = `${doctorId}_${date}`;
      socket.join(roomName);
      console.log(`[Socket] ${socket.id} joined ${roomName}`);
      
      // Send current locks in this room to the newly joined client
      if (activeLocks.has(roomName)) {
        const roomLocks = activeLocks.get(roomName);
        const lockedHours = Array.from(roomLocks.keys());
        socket.emit('sync_locks', { lockedHours });
      }
    });

    socket.on('leave_room', ({ doctorId, date }) => {
      const roomName = `${doctorId}_${date}`;
      socket.leave(roomName);
    });

    socket.on('lock_slot', ({ doctorId, date, hour }) => {
      const roomName = `${doctorId}_${date}`;
      
      if (!activeLocks.has(roomName)) {
        activeLocks.set(roomName, new Map());
      }
      const roomLocks = activeLocks.get(roomName);

      // Check if already locked by someone else
      if (roomLocks.has(hour)) {
        const lock = roomLocks.get(hour);
        if (lock.socketId !== socket.id) {
          socket.emit('lock_failed', { hour, message: 'Slot đã bị người khác giữ' });
          return;
        }
      }

      // Clear previous lock by THIS socket in the SAME room
      // A user should only lock 1 slot at a time per doctor/date
      for (const [existingHour, lockData] of roomLocks.entries()) {
        if (lockData.socketId === socket.id) {
          clearTimeout(lockData.timeoutId);
          roomLocks.delete(existingHour);
          io.to(roomName).emit('slot_unlocked', { hour: existingHour });
        }
      }

      // Create new lock
      const timeoutId = setTimeout(() => {
        // Auto unlock after TTL
        if (roomLocks.has(hour) && roomLocks.get(hour).socketId === socket.id) {
          roomLocks.delete(hour);
          io.to(roomName).emit('slot_unlocked', { hour });
        }
      }, LOCK_TTL);

      roomLocks.set(hour, { socketId: socket.id, timeoutId });
      
      // Broadcast to others in room
      socket.to(roomName).emit('slot_locked', { hour });
      socket.emit('lock_success', { hour });
    });

    // Client manually unlocks (e.g., changes mind or closes modal)
    socket.on('unlock_slot', ({ doctorId, date, hour }) => {
      const roomName = `${doctorId}_${date}`;
      if (activeLocks.has(roomName)) {
        const roomLocks = activeLocks.get(roomName);
        if (roomLocks.has(hour) && roomLocks.get(hour).socketId === socket.id) {
          clearTimeout(roomLocks.get(hour).timeoutId);
          roomLocks.delete(hour);
          io.to(roomName).emit('slot_unlocked', { hour });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      // Find all locks held by this socket and release them
      for (const [roomName, roomLocks] of activeLocks.entries()) {
        for (const [hour, lockData] of roomLocks.entries()) {
          if (lockData.socketId === socket.id) {
            clearTimeout(lockData.timeoutId);
            roomLocks.delete(hour);
            io.to(roomName).emit('slot_unlocked', { hour });
          }
        }
        if (roomLocks.size === 0) {
          activeLocks.delete(roomName);
        }
      }
    });
  });
};
