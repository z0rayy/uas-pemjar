// Data kota-kota di Pulau Jawa dengan koordinat (latitude, longitude)
export interface JavaCity {
  name: string;
  latitude: number;
  longitude: number;
  province: string;
}

export const javaCities: JavaCity[] = [
  // Jawa Barat
  { name: "Bandung", latitude: -6.9175, longitude: 107.6191, province: "Jawa Barat" },
  { name: "Jakarta", latitude: -6.2088, longitude: 106.8456, province: "DKI Jakarta" },
  { name: "Bogor", latitude: -6.5971, longitude: 106.7881, province: "Jawa Barat" },
  { name: "Bekasi", latitude: -6.2349, longitude: 106.9896, province: "Jawa Barat" },
  { name: "Depok", latitude: -6.4025, longitude: 106.8157, province: "Jawa Barat" },
  { name: "Tasikmalaya", latitude: -7.3272, longitude: 108.2216, province: "Jawa Barat" },
  { name: "Cianjur", latitude: -6.8139, longitude: 107.1411, province: "Jawa Barat" },
  { name: "Sukabumi", latitude: -6.9271, longitude: 106.9252, province: "Jawa Barat" },
  { name: "Cirebon", latitude: -6.7058, longitude: 108.5429, province: "Jawa Barat" },
  
  // Jawa Tengah
  { name: "Semarang", latitude: -6.9667, longitude: 110.4167, province: "Jawa Tengah" },
  { name: "Yogyakarta", latitude: -7.8456, longitude: 110.3695, province: "DI Yogyakarta" },
  { name: "Solo", latitude: -7.5606, longitude: 110.8136, province: "Jawa Tengah" },
  { name: "Pekalongan", latitude: -6.8883, longitude: 109.6887, province: "Jawa Tengah" },
  { name: "Tegal", latitude: -6.8673, longitude: 109.1333, province: "Jawa Tengah" },
  { name: "Wonosobo", latitude: -7.7133, longitude: 107.5333, province: "Jawa Tengah" },
  { name: "Salatiga", latitude: -7.3283, longitude: 110.5167, province: "Jawa Tengah" },
  { name: "Magelang", latitude: -7.4833, longitude: 110.1667, province: "Jawa Tengah" },
  { name: "Purwokerto", latitude: -7.4289, longitude: 109.2433, province: "Jawa Tengah" },
  
  // Jawa Timur
  { name: "Surabaya", latitude: -7.2506, longitude: 112.7508, province: "Jawa Timur" },
  { name: "Malang", latitude: -7.9812, longitude: 112.6329, province: "Jawa Timur" },
  { name: "Madura", latitude: -7.0392, longitude: 113.3606, province: "Jawa Timur" },
  { name: "Gresik", latitude: -7.1583, longitude: 112.6533, province: "Jawa Timur" },
  { name: "Sidoarjo", latitude: -7.4425, longitude: 112.7214, province: "Jawa Timur" },
  { name: "Pasuruan", latitude: -7.6428, longitude: 112.9048, province: "Jawa Timur" },
  { name: "Probolinggo", latitude: -7.7526, longitude: 113.2158, province: "Jawa Timur" },
  { name: "Jember", latitude: -8.1711, longitude: 113.7003, province: "Jawa Timur" },
  { name: "Banyuwangi", latitude: -8.2186, longitude: 114.3692, province: "Jawa Timur" },
  { name: "Tulungagung", latitude: -8.0609, longitude: 111.4039, province: "Jawa Timur" },
  { name: "Blitar", latitude: -8.0981, longitude: 111.5046, province: "Jawa Timur" },
];

// Fungsi untuk menghitung jarak antara dua koordinat (Haversine formula)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
