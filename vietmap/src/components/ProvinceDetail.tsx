'use client';

import { useState, useEffect } from 'react';
import { Province, getProvinceInfo } from '../data/provinceData';
import ProvinceMap from './ProvinceMap';

interface GameStats {
  exploredProvinces: Set<string>;
  score: number;
  level: number;
  achievements: string[];
}

interface ProvinceDetailProps {
  provinceName: string;
  onBack: () => void;
  gameStats?: GameStats;
}

export default function ProvinceDetail({ provinceName, onBack, gameStats }: ProvinceDetailProps) {
  const [province, setProvince] = useState<Province | null>(null);
  const [showProvinceMap, setShowProvinceMap] = useState(false);

  useEffect(() => {
    const data = getProvinceInfo(provinceName);
    if (data) {
      setProvince(data);
    } else {
      // Tạo dữ liệu mặc định cho các tỉnh chưa có thông tin
      setProvince({
        name: provinceName,
        capital: 'Đang cập nhật',
        area: 'Đang cập nhật',
        population: 'Đang cập nhật',
        description: `Thông tin chi tiết về ${provinceName} đang được cập nhật.`,
        attractions: ['Đang cập nhật các địa điểm du lịch'],
        coordinates: [16.0, 108.0], // Default to center of Vietnam
        zoom: 8,
        region: 'Trung' // Default region
      });
    }
  }, [provinceName]);

  const handleShowProvinceMap = () => {
    setShowProvinceMap(true);
  };

  if (!province) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {!showProvinceMap ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold text-blue-600 flex items-center">
                  {province.name}
                  <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {province.region === 'Bắc' ? '🏔️ Miền Bắc' : 
                     province.region === 'Trung' ? '🏖️ Miền Trung' : '🌾 Miền Nam'}
                  </span>
                </h2>
                {gameStats && gameStats.exploredProvinces.has(provinceName) && (
                  <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Đã khám phá (+10 điểm)
                  </span>
                )}
              </div>
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Game stats for this province */}
            {gameStats && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🎮 Tiến độ game</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Điểm thưởng:</span>
                    <span className="font-bold text-blue-600 ml-2">+10 điểm</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tổng khám phá:</span>
                    <span className="font-bold text-green-600 ml-2">
                      {gameStats.exploredProvinces.size}/63 tỉnh
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-700">🏛️ Thủ phủ:</span>
                  <span className="text-blue-600 font-medium">{province.capital}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-700">📏 Diện tích:</span>
                  <span className="text-green-600 font-medium">{province.area}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-700">👥 Dân số:</span>
                  <span className="text-purple-600 font-medium">{province.population}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-700">📍 Tọa độ:</span>
                  <span className="text-orange-600 font-medium">
                    {province.coordinates[0].toFixed(2)}, {province.coordinates[1].toFixed(2)}
                  </span>
                </div>
                {province.establishedYear && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-700">📅 Thành lập:</span>
                    <span className="text-indigo-600 font-medium">{province.establishedYear}</span>
                  </div>
                )}
              </div>
              
              {/* Mini preview map */}
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-3">🗺️</div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Bản đồ chi tiết {province.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Khám phá địa danh và điểm tham quan</p>
                  <button
                    onClick={handleShowProvinceMap}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    🔍 Xem bản đồ
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">📖 Giới thiệu</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg text-justify">
                {province.description}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">🎯 Điểm tham quan nổi bật</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {province.attractions.map((attraction, index) => (
                  <div key={index} className="flex items-start bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                    <span className="text-2xl mr-3">
                      {index === 0 ? '🏛️' : index === 1 ? '🌟' : index === 2 ? '🎭' : index === 3 ? '🏞️' : '🎪'}
                    </span>
                    <span className="text-gray-700 font-medium">{attraction}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onBack}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                ⬅️ Quay lại bản đồ Việt Nam
              </button>
              <button
                onClick={handleShowProvinceMap}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                🗺️ Xem bản đồ chi tiết {province.name}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <ProvinceMap 
              province={province}
              onBack={() => setShowProvinceMap(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
