'use client';

import { useEffect, useRef } from 'react';
import { Province } from '../data/provinceData';

interface ProvinceMapProps {
  province: Province;
  onBack: () => void;
}

export default function ProvinceMap({ province, onBack }: ProvinceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Khởi tạo bản đồ tỉnh với Leaflet hoặc Google Maps
    // Hiện tại sử dụng iframe Google Maps
    if (mapRef.current && province.coordinates) {
      const [lat, lng] = province.coordinates;
      mapRef.current.innerHTML = `
        <iframe
          width="100%"  
          height="400"
          style="border:0; border-radius: 8px;"
          loading="lazy"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dH8Do9t4JCjg9k&center=${lat},${lng}&zoom=${province.zoom}&maptype=satellite">
        </iframe>
      `;
    }
  }, [province]);

  const handleOpenGoogleMaps = () => {
    if (province.coordinates) {
      const [lat, lng] = province.coordinates;
      const url = `https://www.google.com/maps/@${lat},${lng},${province.zoom}z`;
      window.open(url, '_blank');
    }
  };

  const handleOpenStreetView = () => {
    if (province.coordinates) {
      const [lat, lng] = province.coordinates;
      const url = `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m1!1e3`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header với thông tin tỉnh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-600 flex items-center">
            🗺️ Bản đồ {province.name}
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {province.region === 'Bắc' ? '🏔️ Miền Bắc' : 
               province.region === 'Trung' ? '🏖️ Miền Trung' : '🌾 Miền Nam'}
            </span>
          </h2>
          <p className="text-gray-600 mt-1">📍 Thủ phủ: {province.capital}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ⬅️ Quay lại
        </button>
      </div>

      {/* Thông tin cơ bản */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">📏 Diện tích</h3>
          <p className="text-xl font-bold text-blue-600">{province.area}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">👥 Dân số</h3>
          <p className="text-xl font-bold text-green-600">{province.population}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-bold text-purple-800 mb-2">🎯 Tọa độ</h3>
          <p className="text-sm text-purple-600">
            {province.coordinates[0].toFixed(4)}°N<br/>
            {province.coordinates[1].toFixed(4)}°E
          </p>
        </div>
      </div>

      {/* Bản đồ tương tác */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">🌐 Bản đồ tương tác</h3>
        <div 
          ref={mapRef}
          className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Đang tải bản đồ...</p>
          </div>
        </div>
        
        {/* Điều khiển bản đồ */}
        <div className="flex justify-center space-x-3 mt-4">
          <button
            onClick={handleOpenGoogleMaps}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            🌍 Mở Google Maps
          </button>
          <button
            onClick={handleOpenStreetView}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
          >
            📷 Street View
          </button>
        </div>
      </div>

      {/* Điểm tham quan nổi bật */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">🎯 Điểm tham quan nổi bật</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {province.attractions.map((attraction, index) => (
            <div key={index} className="flex items-start bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
              <span className="text-2xl mr-3">
                {index === 0 ? '🏛️' : index === 1 ? '🌟' : index === 2 ? '🎭' : index === 3 ? '🏞️' : '🎪'}
              </span>
              <div>
                <span className="font-semibold text-gray-800">{attraction}</span>
                <button
                  onClick={() => {
                    const searchQuery = `${attraction} ${province.name}`;
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                  }}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">📖 Giới thiệu về {province.name}</h3>
        <p className="text-gray-700 leading-relaxed text-justify">
          {province.description}
        </p>
        {province.establishedYear && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>📅 Năm thành lập:</strong> {province.establishedYear}
            </p>
          </div>
        )}
      </div>

      {/* Thông tin bổ sung */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-6">
        <h3 className="text-xl font-bold mb-2">💡 Bạn có biết?</h3>
        <p className="text-blue-100">
          {province.name} thuộc vùng <strong>{province.region === 'Bắc' ? 'Miền Bắc' : 
                                                  province.region === 'Trung' ? 'Miền Trung' : 'Miền Nam'}</strong> 
          {' '}của Việt Nam với diện tích {province.area} và dân số {province.population}.
          {province.region === 'Bắc' && ' Miền Bắc nổi tiếng với khí hậu bốn mùa và nhiều di tích lịch sử.'}
          {province.region === 'Trung' && ' Miền Trung có nhiều di sản văn hóa thế giới và bãi biển đẹp.'}
          {province.region === 'Nam' && ' Miền Nam là vùng đồng bằng sông Cửu Long màu mỡ với văn hóa sông nước.'}
        </p>
      </div>
    </div>
  );
}
