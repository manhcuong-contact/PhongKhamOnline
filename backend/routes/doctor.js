import express from 'express';
import { getDoctors, suggestSpecialty } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/suggest', suggestSpecialty);

export default router;
