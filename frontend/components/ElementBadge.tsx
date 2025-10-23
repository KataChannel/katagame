/**
 * Element Badge Component
 * 
 * Visual indicator for element types with tooltips showing counters
 */

'use client';

import { ElementType } from '@/lib/types';
import { 
  getElementData,
  getElementEmoji,
  getElementColor,
  getElementIconClass,
  getElementCounters,
  getElementWeakness,
} from '@/lib/elementSystem';
import { useState } from 'react';

interface ElementBadgeProps {
  element: ElementType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showName?: boolean;
  className?: string;
}

export function ElementBadge({ 
  element, 
  size = 'md', 
  showTooltip = true,
  showName = false,
  className = '' 
}: ElementBadgeProps) {
  const [showInfo, setShowInfo] = useState(false);
  const elementData = getElementData(element);
  const emoji = getElementEmoji(element);
  const color = getElementColor(element);
  const iconClass = getElementIconClass(element);
  const counters = getElementCounters(element);
  const weakTo = getElementWeakness(element);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className="relative inline-block">
      <div
        className={`
          ${sizeClasses[size]}
          ${iconClass}
          rounded-full
          flex items-center justify-center
          font-bold
          cursor-pointer
          transition-transform hover:scale-110
          ${className}
        `}
        style={{ borderColor: color, borderWidth: '2px' }}
        onMouseEnter={() => showTooltip && setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
        title={elementData.displayName}
      >
        <span className="text-base">{emoji}</span>
      </div>

      {showName && (
        <span className="ml-2 text-sm font-semibold" style={{ color }}>
          {elementData.displayName}
        </span>
      )}

      {/* Tooltip */}
      {showInfo && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl min-w-[200px] text-xs">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
              <span className="text-lg">{emoji}</span>
              <div>
                <div className="font-bold">{elementData.displayName}</div>
                <div className="text-slate-400 text-xs">{elementData.name}</div>
              </div>
            </div>

            {/* Counters */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-green-400">Mạnh với:</span>
                <span>
                  {getElementEmoji(counters)} {getElementData(counters).displayName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400">Yếu với:</span>
                <span>
                  {getElementEmoji(weakTo)} {getElementData(weakTo).displayName}
                </span>
              </div>
            </div>

            {/* Bonuses */}
            <div className="pt-2 border-t border-slate-700 text-yellow-400 text-xs">
              {elementData.bonuses.production && (
                <div>+{elementData.bonuses.production}% sản xuất</div>
              )}
              {elementData.bonuses.combat && (
                <div>+{elementData.bonuses.combat}% tấn công</div>
              )}
              {elementData.bonuses.defense && (
                <div>+{elementData.bonuses.defense}% phòng thủ</div>
              )}
            </div>

            {/* Arrow */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgb(15, 23, 42)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Element Counter Display
 * Shows element matchup with visual indicator
 */
interface ElementCounterDisplayProps {
  attackerElement: ElementType;
  defenderElement: ElementType;
}

export function ElementCounterDisplay({ 
  attackerElement, 
  defenderElement 
}: ElementCounterDisplayProps) {
  const counters = getElementCounters(attackerElement);
  const isStrong = counters === defenderElement;
  const weakness = getElementWeakness(attackerElement);
  const isWeak = weakness === defenderElement;

  return (
    <div className="flex items-center gap-2">
      <ElementBadge element={attackerElement} size="sm" showTooltip={false} />
      
      {isStrong && (
        <span className="text-green-500 font-bold text-sm">→ +50%</span>
      )}
      {isWeak && (
        <span className="text-red-500 font-bold text-sm">→ -25%</span>
      )}
      {!isStrong && !isWeak && (
        <span className="text-slate-400 text-sm">→</span>
      )}
      
      <ElementBadge element={defenderElement} size="sm" showTooltip={false} />
    </div>
  );
}

/**
 * Element Combo Indicator
 * Shows when player has 3+ provinces of same element
 */
interface ElementComboProps {
  element: ElementType;
  count: number;
  isActive: boolean;
}

export function ElementComboIndicator({ element, count, isActive }: ElementComboProps) {
  const elementData = getElementData(element);
  const emoji = getElementEmoji(element);

  return (
    <div 
      className={`
        px-3 py-2 rounded-lg border-2 transition-all
        ${isActive 
          ? 'bg-yellow-100 border-yellow-500 shadow-lg' 
          : 'bg-slate-100 border-slate-300'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="text-sm font-bold">{elementData.displayName}</div>
          <div className="text-xs text-slate-600">
            {count}/3 tỉnh {isActive && '✨ Combo Active! +20%'}
          </div>
        </div>
      </div>
    </div>
  );
}
