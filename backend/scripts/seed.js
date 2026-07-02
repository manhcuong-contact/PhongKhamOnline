import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';
import SymptomSpecialtyMap from '../models/SymptomSpecialtyMap.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const clinicsData = [
  {
    name: 'Phòng khám Đa khoa Hoàn Mỹ',
    address: '42 Phùng Hưng, Hàng Bông, Hoàn Kiếm, Hà Nội',
    location: { lat: 21.0315, lng: 105.8465 },
    specialties: ['Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa', 'Da liễu']
  },
  {
    name: 'Phòng khám Đa khoa Tâm Anh',
    address: '108 Hoàng Như Tiếp, Bồ Đề, Long Biên, Hà Nội',
    location: { lat: 21.0461, lng: 105.8752 },
    specialties: ['Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa', 'Da liễu']
  },
  {
    name: 'Phòng khám Đa khoa Thu Cúc',
    address: '286 Thụy Khuê, Bưởi, Tây Hồ, Hà Nội',
    location: { lat: 21.0423, lng: 105.8157 },
    specialties: ['Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa', 'Da liễu']
  },
  {
    name: 'Phòng khám Đa khoa Medlatec',
    address: '42-44 Nghĩa Dũng, Phúc Xá, Ba Đình, Hà Nội',
    location: { lat: 21.0468, lng: 105.8459 },
    specialties: ['Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa', 'Da liễu']
  },
  {
    name: 'Phòng khám Đa khoa Hồng Ngọc',
    address: 'Tầng 1-2-3, Tổ hợp Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    location: { lat: 21.0169, lng: 105.7836 },
    specialties: ['Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa', 'Da liễu']
  }
];

const symptomMappings = [
  { specialty: 'Nội khoa', keywords: ['đau đầu', 'chóng mặt', 'buồn nôn', 'mệt mỏi', 'sốt', 'khó thở', 'đau ngực'] },
  { specialty: 'Ngoại khoa', keywords: ['chấn thương', 'gãy xương', 'đau cơ', 'bong gân', 'trật khớp', 'vết thương hở'] },
  { specialty: 'Nhi khoa', keywords: ['biếng ăn', 'quấy khóc', 'ho ở trẻ', 'nôn trớ', 'phát ban ở trẻ', 'sốt cao ở trẻ'] },
  { specialty: 'Sản phụ khoa', keywords: ['thai kỳ', 'rong kinh', 'đau bụng dưới', 'khám thai', 'viêm nhiễm phụ khoa'] },
  { specialty: 'Da liễu', keywords: ['nổi mụn', 'mẩn ngứa', 'phát ban', 'viêm da', 'rụng tóc', 'dị ứng da'] }
];

const generateDoctorsForClinic = (clinicId, specialties) => {
  const doctors = [];
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Hoàng', 'Minh', 'Thanh', 'Ngọc', 'Hữu', 'Đức', 'Quang', 'Bá', 'Đình', 'Xuân', 'Kim', 'Bích', 'Thu', 'Hải'];
  const firstNames = ['Anh', 'Bảo', 'Cường', 'Dũng', 'Đạt', 'Giang', 'Hải', 'Huy', 'Khoa', 'Lâm', 'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tuấn', 'Việt', 'Bình', 'Châu', 'Diệp', 'Hoa', 'Lan', 'Linh', 'Mai', 'Ngọc', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Vân', 'Yến'];

  const getRandomName = () => {
    return `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
  };

  const workingHours = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  specialties.forEach(specialty => {
    for (let i = 0; i < 5; i++) {
      doctors.push({
        clinicId,
        name: `BS. ${getRandomName()}`,
        specialty,
        workingHours
      });
    }
  });

  return doctors;
};

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Clinic.deleteMany();
    await Doctor.deleteMany();
    await SymptomSpecialtyMap.deleteMany();

    console.log('Seeding Clinics...');
    const createdClinics = await Clinic.insertMany(clinicsData);
    console.log(`Created ${createdClinics.length} clinics.`);

    console.log('Seeding Doctors...');
    let allDoctors = [];
    for (const clinic of createdClinics) {
      const clinicDoctors = generateDoctorsForClinic(clinic._id, clinic.specialties);
      allDoctors = [...allDoctors, ...clinicDoctors];
    }
    const createdDoctors = await Doctor.insertMany(allDoctors);
    console.log(`Created ${createdDoctors.length} doctors (5 per specialty, 5 specialties per clinic, 5 clinics).`);

    console.log('Seeding Symptom Mappings...');
    const symptomDocs = [];
    symptomMappings.forEach(group => {
      group.keywords.forEach(keyword => {
        symptomDocs.push({
          keyword,
          specialty: group.specialty
        });
      });
    });
    const createdMappings = await SymptomSpecialtyMap.insertMany(symptomDocs);
    console.log(`Created ${createdMappings.length} symptom mappings.`);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
