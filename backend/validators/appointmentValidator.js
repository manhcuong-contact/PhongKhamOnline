import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().length(24, 'ID Bác sĩ không hợp lệ'),
    clinicId: z.string().length(24, 'ID Phòng khám không hợp lệ'),
    datetime: z.string().refine((val) => {
      const date = new Date(val);
      // Đảm bảo là ngày hợp lệ và số phút, giây phải là 00 (đặt lịch block chẵn giờ)
      return !isNaN(date.getTime()) && date.getMinutes() === 0 && date.getSeconds() === 0;
    }, 'Thời gian đặt lịch phải là giờ chẵn (VD: 08:00:00)'),
    symptoms: z.string().min(5, 'Vui lòng mô tả triệu chứng chi tiết hơn (ít nhất 5 ký tự)'),
  }),
});
