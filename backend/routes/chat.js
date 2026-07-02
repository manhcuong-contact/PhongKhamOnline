import express from 'express';
import { chat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat
// Không yêu cầu đăng nhập (Chatbot công khai để tư vấn sơ bộ)
router.post('/', chat);

export default router;
