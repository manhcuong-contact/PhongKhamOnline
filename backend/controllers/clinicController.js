import Clinic from '../models/Clinic.js';

// Thuật toán Haversine: Tính khoảng cách (km) giữa 2 điểm tọa độ trên mặt cầu (Trái Đất)
// Công thức:
// a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
// c = 2 ⋅ atan2( √a, √(1−a) )
// d = R ⋅ c
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371; // Bán kính Trái Đất theo km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

export const getClinics = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    let clinics = await Clinic.find().lean(); // Dùng .lean() để trả về plain JS objects (tối ưu hiệu năng đọc)

    // Nếu có tọa độ từ query, tiến hành filter và sort
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      if (isNaN(userLat) || isNaN(userLng) || userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
        return res.status(400).json({ message: 'Tọa độ không hợp lệ' });
      }

      // Thêm trường distance cho mỗi clinic
      clinics = clinics.map(clinic => {
        const distance = haversineDistance(
          userLat, userLng, 
          clinic.location.lat, clinic.location.lng
        );
        return { ...clinic, distance };
      });

      // Sort tăng dần theo khoảng cách
      clinics.sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json({ clinics });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
