import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { sendReminderEmail } from '../services/emailService.js';

// Job nhắc lịch: chạy mỗi đầu giờ (0 * * * *)
// Tìm các lịch khám cách hiện tại ĐÚNG 24 giờ (trong khoảng cửa sổ 1 giờ tới)
export const startReminderJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Đang kiểm tra nhắc lịch khám...');
    
    try {
      const now = new Date();
      // Cửa sổ thời gian: từ now+23h đến now+25h (để bắt được mọi lịch trong vòng 24h tới)
      const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const windowEnd   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const upcomingAppointments = await Appointment.find({
        datetime: { $gte: windowStart, $lte: windowEnd },
        status: { $in: ['pending', 'confirmed'] },
        reminderSent: { $ne: true }, // Chỉ gửi 1 lần (cần thêm field này vào Model)
      })
        .populate('userId', 'email name')
        .populate('doctorId', 'name')
        .lean();

      console.log(`[Cron] Tìm thấy ${upcomingAppointments.length} lịch khám sắp đến.`);

      for (const appointment of upcomingAppointments) {
        const appTime = new Date(appointment.datetime);
        const dateStr = `${appTime.toLocaleDateString('vi-VN')} lúc ${appTime.getHours()}:00`;

        await sendReminderEmail(
          appointment.userId.email,
          appointment.userId.name,
          appointment.doctorId.name,
          dateStr
        );

        // Đánh dấu đã gửi nhắc để không gửi lại
        await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });
      }
    } catch (error) {
      console.error('[Cron Error] Lỗi khi gửi nhắc lịch:', error);
    }
  });

  console.log('[Cron] Reminder job đã được kích hoạt (chạy mỗi đầu giờ).');
};
