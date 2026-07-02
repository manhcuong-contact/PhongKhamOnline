import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

// Brevo v5 SDK - dùng BrevoClient với apiKey
const getClient = () => new BrevoClient({ apiKey: process.env.BREVO_API_KEY || '' });

const SENDER = { email: 'no-reply@phongkhamonline.com', name: 'Phòng Khám Online' };

const sendEmail = async ({ to, subject, htmlContent }) => {
  if (!process.env.BREVO_API_KEY) {
    console.log('[Email] BREVO_API_KEY chưa cấu hình, bỏ qua gửi email.');
    return;
  }
  try {
    const client = getClient();
    await client.transactionalEmails.sendTransacEmail({
      sender: SENDER,
      to,
      subject,
      htmlContent,
    });
    console.log(`[Email] Đã gửi "${subject}" tới ${to[0].email}`);
  } catch (error) {
    console.error('[Email Error]', error?.message || error);
  }
};

export const sendBookingConfirmation = (userEmail, userName, doctorName, dateStr) =>
  sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: 'Xác nhận đặt lịch khám thành công ✅',
    htmlContent: `
      <h3>Xin chào ${userName},</h3>
      <p>Bạn đã đặt lịch khám thành công với bác sĩ <strong>${doctorName}</strong>.</p>
      <p>Thời gian: <strong style="color:#059669">${dateStr}</strong></p>
      <p>Vui lòng đến trước 15 phút để làm thủ tục.</p>
      <br/><p>Trân trọng,<br/>Hệ thống Phòng Khám Online</p>
    `,
  });

export const sendBookingCancellation = (userEmail, userName, doctorName, dateStr) =>
  sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: 'Thông báo hủy lịch khám ❌',
    htmlContent: `
      <h3>Xin chào ${userName},</h3>
      <p>Lịch khám với bác sĩ <strong>${doctorName}</strong> vào lúc <strong>${dateStr}</strong> đã được hủy.</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
      <br/><p>Trân trọng,<br/>Hệ thống Phòng Khám Online</p>
    `,
  });

export const sendCompletionEmail = (userEmail, userName, doctorName, dateStr) =>
  sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: 'Khám bệnh thành công ✅',
    htmlContent: `
      <h3>Xin chào ${userName},</h3>
      <p>Cuộc hẹn khám bệnh của bạn với bác sĩ <strong>${doctorName}</strong> vào lúc <strong>${dateStr}</strong> đã hoàn thành.</p>
      <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Hệ thống Phòng Khám Online.</p>
      <p>Chúc bạn thật nhiều sức khỏe!</p>
      <br/><p>Trân trọng,<br/>Hệ thống Phòng Khám Online</p>
    `,
  });

export const sendReminderEmail = (userEmail, userName, doctorName, dateStr) =>
  sendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: '⏰ Nhắc lịch khám ngày mai',
    htmlContent: `
      <h3>Xin chào ${userName},</h3>
      <p>Bạn có lịch khám với bác sĩ <strong>${doctorName}</strong> vào <strong style="color:#059669">${dateStr}</strong>.</p>
      <p>Vui lòng đến trước <strong>15 phút</strong> và mang theo giấy tờ tùy thân.</p>
      <br/><p>Trân trọng,<br/>Hệ thống Phòng Khám Online</p>
    `,
  });
