'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { WuXingCycleData } from '@/lib/types/mvp1.types';

interface WuXingCycleProps {
  cycleData: WuXingCycleData;
}

/**
 * WuXingCycle Component - MVP2 Sprint 4
 * Visual representation of Five Elements (Ngũ Hành) synergy cycle
 * Wood → Fire → Earth → Metal → Water → Wood
 */
export default function WuXingCycle({ cycleData }: WuXingCycleProps) {
  const { cycleNodes, cycleCompletion, totalBonus, description } = cycleData;

  return (
    <div className="bg-gradient-to-br from-green-50 via-orange-50 to-blue-50 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          ☯️ Hệ Thống Ngũ Hành
        </h2>
        <p className="text-sm text-gray-600">{description}</p>
        
        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Chu Kỳ Hoàn Thành</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(cycleCompletion)}%
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cycleCompletion}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Tổng Thưởng</div>
            <div className="text-2xl font-bold text-purple-600">
              +{totalBonus}%
            </div>
            <div className="text-xs text-gray-500">sản xuất tài nguyên</div>
          </div>
        </div>
      </div>

      {/* Cycle Visualization - Circular Layout */}
      <div className="relative w-full max-w-2xl mx-auto">
        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="text-3xl mb-1">☯️</div>
              <div className="text-xs font-bold text-gray-700">Ngũ Hành</div>
              <div className="text-xs text-gray-600">{cycleNodes.filter(n => n.isActive).length}/5</div>
            </div>
          </div>
        </div>

        {/* Elements in Pentagon */}
        <div className="relative aspect-square">
          {cycleNodes.map((node, index) => {
            // Pentagon positioning (72 degrees per element)
            const angle = (index * 72 - 90) * (Math.PI / 180); // Start from top
            const radius = 45; // percentage
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);

            return (
              <motion.div
                key={node.element}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Element Node */}
                <div
                  className={`
                    relative w-24 h-24 rounded-full shadow-lg
                    flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer
                    ${node.isActive 
                      ? 'bg-gradient-to-br from-green-400 to-blue-500 scale-110 ring-4 ring-green-300' 
                      : 'bg-white border-4 border-gray-300'
                    }
                  `}
                >
                  <div className={`text-3xl mb-1 ${node.isActive ? 'animate-bounce' : ''}`}>
                    {node.emoji}
                  </div>
                  <div className={`text-xs font-bold ${node.isActive ? 'text-white' : 'text-gray-700'}`}>
                    {node.elementName}
                  </div>
                  <div className={`text-[10px] ${node.isActive ? 'text-green-100' : 'text-gray-500'}`}>
                    {node.resourceNameVN}
                  </div>
                  
                  {/* Active Indicator */}
                  {node.isActive && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" />
                    </div>
                  )}

                  {/* Bonus Badge */}
                  {node.isActive && node.bonusPercentage > 0 && (
                    <div className="absolute -bottom-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      +{node.bonusPercentage}%
                    </div>
                  )}
                </div>

                {/* Arrow to Next Element */}
                <div className="absolute top-1/2 left-full ml-2">
                  <motion.div
                    animate={{
                      x: node.isActive ? [0, 5, 0] : 0,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: node.isActive ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRight 
                      className={`w-8 h-8 ${node.isActive ? 'text-green-500' : 'text-gray-300'}`}
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Synergies List */}
      {cycleData.activeSynergies.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Tương Sinh Đang Hoạt Động
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cycleData.activeSynergies.map((synergy, index) => (
              <motion.div
                key={`${synergy.sourceResource}-${synergy.targetResource}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 border-2 border-green-300 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{synergy.icon}</span>
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    +{synergy.bonusPercentage}%
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-medium">{synergy.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Ảnh hưởng {synergy.affectedProvinces} tỉnh thành
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Active Synergies */}
      {cycleData.activeSynergies.length === 0 && (
        <div className="mt-8 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-2">Chưa có tương sinh hoạt động</p>
              <p className="text-xs">
                Để kích hoạt tương sinh, bạn cần sở hữu các tỉnh sản xuất tài nguyên theo chu kỳ Ngũ Hành:
                <br />
                • Gỗ (Mộc) sinh Lửa (Hỏa)
                <br />
                • Lửa (Hỏa) sinh Đất (Thổ)
                <br />
                • Đất (Thổ) sinh Vàng (Kim)
                <br />
                • Vàng (Kim) sinh Nước (Thủy)
                <br />
                • Nước (Thủy) sinh Gỗ (Mộc)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Chú Thích:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {cycleNodes.map((node) => (
            <div key={node.element} className="flex items-center gap-2">
              <span className="text-xl">{node.emoji}</span>
              <div>
                <div className="font-semibold text-gray-700">{node.elementName}</div>
                <div className="text-gray-500">{node.resourceNameVN}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
