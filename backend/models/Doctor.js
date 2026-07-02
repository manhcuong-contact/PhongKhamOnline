import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    workingHours: [
      {
        type: String, // e.g., '08:00-09:00'
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Doctor', doctorSchema);
