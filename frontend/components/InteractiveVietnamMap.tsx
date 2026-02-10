'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Shield, Zap, Info, X } from 'lucide-react';
import { WorldProvince } from '@/lib/worldMapSystem';

interface InteractiveMapProps {
  provinces: WorldProvince[];
  currentProvince: string | null;
  onProvinceClick: (province: WorldProvince) => void;
  getElementEmoji: (element: string) => string;
}

export default function InteractiveVietnamMap({
  provinces,
  currentProvince,
  onProvinceClick,
  getElementEmoji,
}: InteractiveMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<WorldProvince | null>(null);

  return (
    <div className="relative w-full aspect-[2/3] bg-[#1a1c23] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Decorative Background Elements - Ancient Style */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Map Content Container */}
      <div className="absolute inset-4 md:inset-8">
        {/* Era Indicator */}
        <div className="absolute top-0 right-0 p-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 z-10">
          <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest">Era 1: Khởi Nguyên</span>
        </div>

        {/* Connection Lines (Optional: could link required provinces) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          {provinces.map(province => {
            if (!province.requiredProvinces) return null;
            return province.requiredProvinces.map(reqId => {
              const req = provinces.find(p => p.id === reqId);
              if (!req) return null;
              return (
                <line
                  key={`${req.id}-${province.id}`}
                  x1={`${req.coordinates.x}%`}
                  y1={`${req.coordinates.y}%`}
                  x2={`${province.coordinates.x}%`}
                  y2={`${province.coordinates.y}%`}
                  stroke={province.status === 'locked' ? '#4b5563' : '#10b981'}
                  strokeWidth="2"
                  strokeDasharray={province.status === 'locked' ? '4 4' : '0'}
                />
              );
            });
          })}
        </svg>

        {/* Province Nodes */}
        {provinces.map((province) => {
          const isCurrent = currentProvince === province.id;
          const isLocked = province.status === 'locked';
          const isCompleted = province.status === 'completed';
          
          return (
            <motion.div
              key={province.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{
                left: `${province.coordinates.x}%`,
                top: `${province.coordinates.y}%`,
              }}
              whileHover={{ scale: 1.2, zIndex: 20 }}
              onClick={() => onProvinceClick(province)}
              onMouseEnter={() => setHoveredProvince(province)}
              onMouseLeave={() => setHoveredProvince(null)}
            >
              {/* Node Visual */}
              <div 
                className={`relative w-4 h-4 md:w-6 md:h-6 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 ${
                  isCurrent 
                    ? 'bg-yellow-400 ring-4 ring-yellow-400/30' 
                    : isCompleted
                      ? 'bg-blue-500 ring-2 ring-blue-400/50'
                      : isLocked
                        ? 'bg-gray-700 ring-2 ring-gray-600'
                        : 'bg-green-500 ring-4 ring-green-500/30 animate-pulse'
                }`}
              >
                {/* Icons inside node */}
                {isLocked && <Lock className="w-2 h-2 md:w-3 md:h-3 text-gray-400" />}
                {isCurrent && <Shield className="w-2 h-2 md:w-3 md:h-3 text-yellow-900" />}
                {isCompleted && <Star className="w-2 h-2 md:w-3 md:h-3 text-white" />}
                
                {/* Ripple Effect for unlocked/active */}
                {!isLocked && (
                  <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isCurrent ? 'bg-yellow-400' : 'bg-green-500'}`} />
                )}
              </div>

              {/* Label - Only show for important ones or active */}
              {(isCurrent || !isLocked) && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap hidden md:block">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm ${
                    isCurrent ? 'bg-yellow-500/90 text-black' : 'bg-gray-900/80 text-white'
                  }`}>
                    {province.name}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip Popup */}
      <AnimatePresence>
        {hoveredProvince && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`absolute z-30 p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10 w-64 pointer-events-none ${
              // Intelligent positioning logic could be added here
              hoveredProvince.coordinates.x > 50 ? 'right-4' : 'left-4'
            } ${
              hoveredProvince.coordinates.y > 50 ? 'bottom-4' : 'top-4'
            } bg-slate-900/90 text-white`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <span className="text-2xl">{getElementEmoji(hoveredProvince.element)}</span>
                {hoveredProvince.name}
              </h4>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                hoveredProvince.status === 'locked' ? 'bg-gray-700 text-gray-400' :
                hoveredProvince.status === 'completed' ? 'bg-blue-600 text-white' :
                'bg-green-600 text-white'
              }`}>
                {hoveredProvince.status === 'locked' ? 'Chưa mở' : 
                 hoveredProvince.status === 'completed' ? 'Hoàn thành' : 'Đang mở'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Cấp độ:</span>
                <span className="font-mono text-white">{hoveredProvince.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Ngũ Hành:</span>
                <span className="font-mono text-white capitalize">{hoveredProvince.element}</span>
              </div>
              
              {hoveredProvince.status === 'locked' && hoveredProvince.requiredProvinces && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-red-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Yêu cầu:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hoveredProvince.requiredProvinces.map(reqId => (
                      <span key={reqId} className="text-xs bg-red-900/50 px-1.5 rounded border border-red-800/50">
                        {provinces.find(p => p.id === reqId)?.name || reqId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hoveredProvince.status !== 'locked' && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-green-300 mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Phần thưởng:
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {hoveredProvince.rewards.slice(0, 2).map((r, i) => (
                      <span key={i} className="text-xs bg-green-900/30 px-1.5 py-0.5 rounded text-green-100 flex items-center gap-1">
                        + {r.quantity} {r.type === 'gold' ? 'Vàng' : r.type === 'gems' ? 'Ngọc' : 'Đồ'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/5 text-xs text-gray-300 space-y-1 z-20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/30"></div>
          <span>Đang đóng quân</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/30"></div>
          <span>Đã mở khóa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></div>
          <span>Chưa mở</span>
        </div>
      </div>
    </div>
  );
}
