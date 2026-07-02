import express from 'express';
import { getClinics } from '../controllers/clinicController.js';

const router = express.Router();

// GET /api/clinics?lat=...&lng=...
router.get('/', getClinics);

export default router;
