'use client';

import { useEffect, useState, useCallback } from 'react';
import ProvinceDetail from './ProvinceDetail';
import D3Map from './D3Map';

interface ProvinceFeature {
  type: 'Feature';
  properties: {
    name: string;
    id?: string;
    source?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point';
    coordinates: number[][] | number[][][] | number[][][][];
  };
  id?: number;
}

interface VietnamGeoJSON {
  type: 'FeatureCollection';
  features: ProvinceFeature[];
}

interface GameStats {
  exploredProvinces: Set<string>;
  score: number;
  level: number;
  achievements: string[];
}

export default function VietnamMap() {
  const [geoData, setGeoData] = useState<VietnamGeoJSON | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showProvinceDetail, setShowProvinceDetail] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<GameStats>({
    exploredProvinces: new Set(),
    score: 0,
    level: 1,
    achievements: []
  });

  useEffect(() => {
    fetch('/vietnam.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: VietnamGeoJSON) => {
        if (data && data.features && Array.isArray(data.features)) {
          setGeoData(data);
          setLoading(false);
        } else {
          throw new Error('Invalid GeoJSON data structure');
        }
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        setLoading(false);
        // Set error state or fallback data
      });
  }, []);

  // Memoized coordinate projection function
  const projectCoordinates = useCallback((coords: number[]) => {
    const [lng, lat] = coords;
    // Sử dụng phép chiếu đơn giản cho Việt Nam
    const x = (lng - 102) * 8 + 200; // Scale và offset cho kinh độ
    const y = (23 - lat) * 8 + 50;   // Scale và offset cho vĩ độ (đảo ngược)
    return [x, y];
  }, []);

  // Memoized path creation function
  const createPath = useCallback((coordinates: number[][] | number[][][] | number[][][][]) => {
    if (!coordinates || coordinates.length === 0) return '';
    
    try {
      let pathData = '';
      
      // Kiểm tra cấu trúc dữ liệu
      const firstCoord = coordinates[0];
      if (Array.isArray(firstCoord)) {
        const secondLevel = firstCoord[0];
        if (Array.isArray(secondLevel)) {
          const thirdLevel = secondLevel[0];
          if (Array.isArray(thirdLevel)) {
            // MultiPolygon
            (coordinates as number[][][][]).forEach(polygon => {
              polygon.forEach((ring) => {
                ring.forEach((coord, index) => {
                  const [x, y] = projectCoordinates(coord);
                  if (index === 0) {
                    pathData += `M ${x} ${y} `;
                  } else {
                    pathData += `L ${x} ${y} `;
                  }
                });
                pathData += 'Z ';
              });
            });
          } else {
            // Polygon
            (coordinates as number[][][]).forEach((ring) => {
              ring.forEach((coord, index) => {
                const [x, y] = projectCoordinates(coord);
                if (index === 0) {
                  pathData += `M ${x} ${y} `;
                } else {
                  pathData += `L ${x} ${y} `;
                }
              });
              pathData += 'Z ';
            });
          }
        }
      }
      
      return pathData;
    } catch (error) {
      console.error('Error creating path:', error);
      return '';
    }
  }, [projectCoordinates]);

  const handleProvinceClick = useCallback((provinceName: string) => {
    setSelectedProvince(provinceName);
    setShowProvinceDetail(provinceName);
    
    // Cập nhật game stats
    setGameStats(prev => {
      const newExplored = new Set(prev.exploredProvinces);
      const isNewProvince = !newExplored.has(provinceName);
      
      if (isNewProvince) {
        newExplored.add(provinceName);
        const newScore = prev.score + 10;
        const newLevel = Math.floor(newScore / 100) + 1;
        
        // Kiểm tra achievements
        const newAchievements = [...prev.achievements];
        if (newExplored.size === 1 && !newAchievements.includes('Nhà thám hiểm mới')) {
          newAchievements.push('Nhà thám hiểm mới');
        }
        if (newExplored.size === 10 && !newAchievements.includes('Khám phá cơ bản')) {
          newAchievements.push('Khám phá cơ bản');
        }
        if (newExplored.size === 30 && !newAchievements.includes('Chuyên gia địa lý')) {
          newAchievements.push('Chuyên gia địa lý');
        }
        if (newExplored.size === 63 && !newAchievements.includes('Bậc thầy bản đồ')) {
          newAchievements.push('Bậc thầy bản đồ');
        }
        
        return {
          exploredProvinces: newExplored,
          score: newScore,
          level: newLevel,
          achievements: newAchievements
        };
      }
      
      return prev;
    });
  }, []);

  const handleProvinceHover = useCallback((provinceName: string | null) => {
    setHoveredProvince(provinceName);
  }, []);

  const resetGame = useCallback(() => {
    setGameStats({
      exploredProvinces: new Set(),
      score: 0,
      level: 1,
      achievements: []
    });
    setSelectedProvince(null);
    setShowProvinceDetail(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl text-blue-800 font-semibold">🎮 Đang tải game bản đồ Việt Nam...</p>
          <p className="text-blue-600">Khám phá 63 tỉnh thành phố của Việt Nam!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Game Header */}
      <div className="absolute top-4 left-4 z-10 game-panel p-4 rounded-lg shadow-lg border border-blue-200">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">🎮 Game Khám Phá Việt Nam</h1>
        <p className="text-sm text-gray-600 mb-2">Mục tiêu: Khám phá tất cả 63 tỉnh thành!</p>
        
        {/* Current Province Info */}
        {selectedProvince && (
          <div className="mt-2 p-2 bg-blue-100 rounded border border-blue-300">
            <p className="text-sm font-semibold text-blue-800">🎯 Đang khám phá:</p>
            <p className="text-blue-600 font-bold">{selectedProvince}</p>
          </div>
        )}
        
        {hoveredProvince && !selectedProvince && (
          <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
            <p className="text-sm font-semibold text-yellow-800">👀 Đang nhìn:</p>
            <p className="text-yellow-600 font-bold">{hoveredProvince}</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex items-center justify-center h-full p-4">
        {geoData && (
          <D3Map
            geoData={geoData}
            selectedProvince={selectedProvince}
            onProvinceClick={handleProvinceClick}
            onProvinceHover={handleProvinceHover}
            exploredProvinces={gameStats.exploredProvinces}
          />
        )}
      </div>

      {/* Game Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg border border-blue-200">
        <h3 className="font-bold mb-2 text-blue-800">🎮 Hướng dẫn chơi:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• 🖱️ Di chuột qua tỉnh để xem tên</li>
          <li>• 👆 Click vào tỉnh để khám phá (+10 điểm)</li>
          <li>• 🏆 Thu thập achievements</li>
          <li>• � Mục tiêu: Khám phá tất cả 63 tỉnh!</li>
        </ul>
        
        {/* Color Legend */}
        <div className="mt-3 text-xs">
          <h4 className="font-semibold mb-1">Chú thích màu:</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-300 border border-blue-600 mr-2 rounded"></div>
              <span>Chưa khám phá</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 border border-blue-600 mr-2 rounded"></div>
              <span>Đã khám phá</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 border border-blue-600 mr-2 rounded"></div>
              <span>Đang chọn</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          Tổng: {geoData?.features.filter(f => f.geometry.type !== 'Point').length || 0} tỉnh thành
        </div>
      </div>

      {/* Game Stats Panel */}
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg border border-green-200">
        <h3 className="font-bold text-green-800 mb-2">� Thống kê Game</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>Level:</span>
            <span className="font-bold text-purple-600 text-lg">
              {gameStats.level}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Điểm số:</span>
            <span className="font-bold text-blue-600">
              {gameStats.score}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Đã khám phá:</span>
            <span className="font-bold text-green-600">
              {gameStats.exploredProvinces.size}/63
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full progress-bar"
              style={{ width: `${(gameStats.exploredProvinces.size / 63) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 text-center">
            {Math.round((gameStats.exploredProvinces.size / 63) * 100)}% hoàn thành
          </div>
        </div>

        {/* Achievements */}
        {gameStats.achievements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-bold text-yellow-600 mb-2">🏆 Thành tích:</h4>
            <div className="space-y-1">
              {gameStats.achievements.map((achievement, index) => (
                <div key={index} className="text-xs bg-yellow-100 px-2 py-1 rounded achievement-badge">
                  {achievement}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Controls */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={resetGame}
            className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            🔄 Reset Game
          </button>
        </div>
      </div>

      {/* Province Detail Modal */}
      {showProvinceDetail && (
        <ProvinceDetail
          provinceName={showProvinceDetail}
          onBack={() => {
            setShowProvinceDetail(null);
            setSelectedProvince(null);
          }}
          gameStats={gameStats}
        />
      )}

      {/* Achievement Notification */}
      {gameStats.achievements.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1500]">
          {/* This could be expanded with animation for new achievements */}
        </div>
      )}
    </div>
  );
}
