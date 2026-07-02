import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System Prompt định hướng AI chỉ tư vấn về y tế, không lan man
const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn sức khỏe của hệ thống "Phòng Khám Online". 
Nhiệm vụ của bạn là:
1. Tư vấn người dùng nên gặp bác sĩ chuyên khoa nào dựa trên triệu chứng họ mô tả.
2. Cung cấp thông tin sơ bộ về các vấn đề sức khỏe thông thường.
3. Luôn nhắc nhở người dùng đây chỉ là tư vấn sơ bộ và nên đặt lịch gặp bác sĩ để được khám chính xác.
4. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và rõ ràng.
5. KHÔNG chẩn đoán bệnh, KHÔNG kê đơn thuốc, KHÔNG thay thế ý kiến bác sĩ.
6. Nếu người dùng hỏi về chủ đề không liên quan đến sức khỏe, lịch hẹn, hoặc phòng khám, hãy lịch sự từ chối và hướng họ về chủ đề y tế.`;

let finalSystemPrompt = SYSTEM_PROMPT;
try {
  const faqPath = path.join(__dirname, '../data/faq.csv');
  if (fs.existsSync(faqPath)) {
    const faqData = fs.readFileSync(faqPath, 'utf8');
    finalSystemPrompt += '\n\nSau đây là dữ liệu FAQ của phòng khám, hãy dùng nó để trả lời chính xác các câu hỏi cơ bản của người dùng:\n' + faqData;
  }
} catch (e) {
  console.error('Error reading faq.csv', e);
}

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không hợp lệ' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'Dịch vụ AI tạm thời không khả dụng' });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: finalSystemPrompt,
    });

    // Chuyển đổi lịch sử hội thoại sang định dạng Gemini
    const formattedHistory = (history || []).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const chatSession = model.startChat({ history: formattedHistory });
    const result = await chatSession.sendMessage(message.trim());
    const response = result.response.text();

    res.status(200).json({ reply: response });
  } catch (error) {
    console.error('[Gemini Error]', error);
    res.status(500).json({ message: 'Lỗi AI, vui lòng thử lại sau' });
  }
};
