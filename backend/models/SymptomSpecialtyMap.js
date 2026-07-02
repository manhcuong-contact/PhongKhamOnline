import mongoose from 'mongoose';

const symptomSpecialtyMapSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    specialty: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SymptomSpecialtyMap', symptomSpecialtyMapSchema);
