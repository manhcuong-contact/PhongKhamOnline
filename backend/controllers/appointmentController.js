import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../services/emailService.js';

// Hàm helper để parse workingHours (VD: '08:00-09:00' -> 8)
const getStartHour = (timeStr) => parseInt(timeStr.split(':')[0], 10);

// Thuật toán tìm slot thay thế
const findAlternativeSlot = async (doctorId, requestedDate) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.workingHours || doctor.workingHours.length === 0) return null;

  // Lấy các giờ làm việc hợp lệ của bác sĩ (chỉ lấy phần giờ bắt đầu)
  const validHours = doctor.workingHours.map(getStartHour).sort((a, b) => a - b);
  
  const reqDateObj = new Date(requestedDate);
  const reqHour = reqDateObj.getHours();

  // Tìm các cuộc hẹn đã đặt của bác sĩ trong cùng ngày và ngày hôm sau
  const startOfDay = new Date(reqDateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfNextDay = new Date(startOfDay);
  endOfNextDay.setDate(endOfNextDay.getDate() + 2);

  const existingAppointments = await Appointment.find({
    doctorId,
    datetime: { $gte: startOfDay, $lt: endOfNextDay },
    status: { $ne: 'cancelled' }
  }).lean();

  const isSlotBooked = (dateToCheck) => {
    return existingAppointments.some(
      (app) => new Date(app.datetime).getTime() === dateToCheck.getTime()
    );
  };

  const isPast = (dateToCheck) => dateToCheck.getTime() < new Date().getTime();

  // 1. Quét trong cùng ngày trước (cả trước và sau giờ mong muốn)
  // Ưu tiên khoảng cách thời gian gần nhất với giờ yêu cầu
  let sameDayCandidates = [];
  for (const hour of validHours) {
    if (hour === reqHour) continue; // Bỏ qua giờ bị trùng hiện tại
    
    const candidateDate = new Date(reqDateObj);
    candidateDate.setHours(hour, 0, 0, 0);
    
    if (!isPast(candidateDate) && !isSlotBooked(candidateDate)) {
      sameDayCandidates.push(candidateDate);
    }
  }

  // Sort theo độ lệch thời gian so với giờ yêu cầu (gần nhất xếp trước)
  if (sameDayCandidates.length > 0) {
    sameDayCandidates.sort((a, b) => 
      Math.abs(a.getHours() - reqHour) - Math.abs(b.getHours() - reqHour)
    );
    return sameDayCandidates[0];
  }

  // 2. Nếu trong ngày hết slot trống, chuyển sang ngày kế tiếp
  const nextDay = new Date(reqDateObj);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);

  // Quét ngày hôm sau
  for (const hour of validHours) {
    const candidateDate = new Date(nextDay);
    candidateDate.setHours(hour, 0, 0, 0);
    
    if (!isPast(candidateDate) && !isSlotBooked(candidateDate)) {
      // Trả về slot đầu tiên của ngày hôm sau
      return candidateDate;
    }
  }

  return null; // Hoàn toàn hết lịch
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, clinicId, datetime, symptoms } = req.body;
    const userId = req.user._id;

    const requestedDate = new Date(datetime);

    if (requestedDate.getTime() < new Date().getTime()) {
      return res.status(400).json({ message: 'Không thể đặt lịch vào quá khứ' });
    }

    // Kiểm tra xem slot đã bị đặt chưa (Race condition simple check)
    const existingApp = await Appointment.findOne({
      doctorId,
      datetime: requestedDate,
      status: { $ne: 'cancelled' }
    });

    if (existingApp) {
      // Bị trùng lịch -> Gọi thuật toán tìm slot thay thế
      const alternativeSlot = await findAlternativeSlot(doctorId, requestedDate);
      
      if (alternativeSlot) {
        return res.status(409).json({ 
          message: 'Giờ này đã có người đặt.', 
          alternativeSlot: alternativeSlot.toISOString() 
        });
      } else {
        return res.status(409).json({ 
          message: 'Bác sĩ đã kín lịch trong hôm nay và ngày mai. Vui lòng chọn ngày khác.' 
        });
      }
    }

    // Nếu trống, tiến hành tạo
    const appointment = await Appointment.create({
      userId,
      doctorId,
      clinicId,
      datetime: requestedDate,
      symptoms,
      status: 'pending' // Chờ thanh toán/khám
    });

    // Gọi hàm gửi email không đồng bộ (không dùng await ở ngoài cùng để block response)
    const user = await User.findById(userId);
    const doctor = await Doctor.findById(doctorId);
    const dateStr = `${requestedDate.toLocaleDateString('vi-VN')} lúc ${requestedDate.getHours()}:00`;
    sendBookingConfirmation(user.email, user.name, doctor.name, dateStr);

    res.status(201).json({ message: 'Đặt lịch thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('doctorId', 'name specialty')
      .populate('clinicId', 'name address')
      .sort({ datetime: -1 });
      
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Chỉ tìm appointment của chính user này
    const appointment = await Appointment.findOne({ _id: id, userId })
      .populate('doctorId', 'name')
      .populate('userId', 'email name');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch khám' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Lịch khám này đã bị hủy từ trước' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Không thể hủy lịch khám đã hoàn thành' });
    }

    // Luật 24h: Kiểm tra xem thời gian khám có > 24h so với hiện tại không
    const now = new Date();
    const appTime = new Date(appointment.datetime);
    const hoursDifference = (appTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference <= 24) {
      return res.status(403).json({ 
        message: 'Bạn chỉ có thể hủy lịch trước ít nhất 24 tiếng so với giờ khám.' 
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const dateStr = `${appTime.toLocaleDateString('vi-VN')} lúc ${appTime.getHours()}:00`;
    sendBookingCancellation(appointment.userId.email, appointment.userId.name, appointment.doctorId.name, dateStr);

    res.status(200).json({ message: 'Hủy lịch thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
