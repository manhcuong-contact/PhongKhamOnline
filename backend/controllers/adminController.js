import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';
import { sendCompletionEmail } from '../services/emailService.js';

export const getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totalUsers, totalClinics, totalDoctors, todayAppointments, statusBreakdown] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Clinic.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments({ datetime: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
    ]);

    const stats = { totalUsers, totalClinics, totalDoctors, todayAppointments };
    const breakdown = {};
    statusBreakdown.forEach(s => { breakdown[s._id] = s.count; });

    res.status(200).json({ stats, breakdown });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('userId', 'name email')
        .populate('doctorId', 'name specialty')
        .populate('clinicId', 'name')
        .sort({ datetime: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.status(200).json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'name email')
      .populate('doctorId', 'name');
    if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

    if (status === 'completed' && appointment.userId?.email) {
      const appTime = new Date(appointment.datetime);
      const dateStr = `${appTime.toLocaleDateString('vi-VN')} lúc ${appTime.getHours()}:00`;
      sendCompletionEmail(appointment.userId.email, appointment.userId.name, appointment.doctorId.name, dateStr);
    }

    res.status(200).json({ message: 'Cập nhật thành công', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
