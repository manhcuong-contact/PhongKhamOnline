import Doctor from '../models/Doctor.js';
import SymptomSpecialtyMap from '../models/SymptomSpecialtyMap.js';

export const getDoctors = async (req, res) => {
  try {
    const { clinicId, specialty } = req.query;
    const filter = {};
    if (clinicId) filter.clinicId = clinicId;
    if (specialty) filter.specialty = specialty;

    const doctors = await Doctor.find(filter).populate('clinicId', 'name address location');
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

export const suggestSpecialty = async (req, res) => {
  try {
    const { symptoms } = req.query; // e.g., "tôi bị đau đầu và sốt"
    
    if (!symptoms) {
      return res.status(400).json({ message: 'Vui lòng nhập triệu chứng' });
    }

    const keywords = await SymptomSpecialtyMap.find().lean();
    
    const matchedSpecialties = new Set();
    const lowerSymptoms = symptoms.toLowerCase();

    for (const item of keywords) {
      if (lowerSymptoms.includes(item.keyword)) {
        matchedSpecialties.add(item.specialty);
      }
    }

    res.status(200).json({ 
      specialties: Array.from(matchedSpecialties) 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
