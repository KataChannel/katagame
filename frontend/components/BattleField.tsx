/**
 * BattleField Component - Main Combat Screen
 * 
 * Mobile-first turn-based combat interface
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Heart, Zap, ArrowLeft, Trophy } from 'lucide-react';
import { Hero, Enemy } from '@/lib/types';
import { 
  CombatState, 
  initializeCombat, 
  processHeroTurn, 
  processEnemyTurn,
  nextTurn,
  calculateRewards,
  createCombatResult,
} from '@/lib/combatSystem';
import { ElementBadge, ElementCounterDisplay } from './ElementBadge';
import { touchTargets } from '@/lib/mobileDesignSystem';
import { useGameStore } from '@/lib/gameStore';

interface BattleFieldProps {
  heroes: Hero[];
  enemies: Enemy[];
  onBattleEnd: (victory: boolean) => void;
  onExit: () => void;
}

export default function BattleField({ heroes, enemies, onBattleEnd, onExit }: BattleFieldProps) {
  const [combat, setCombat] = useState<CombatState>(() => 
    initializeCombat(heroes, enemies, 30)
  );
  const [selectedHeroId, setSelectedHeroId] = useState<string>(heroes[0]?.id || '');
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>(enemies[0]?.id || '');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { recordCombat, player } = useGameStore();

  // Auto-select first alive hero
  useEffect(() => {
    const aliveHero = combat.heroes.find(h => !h.isDead);
    if (aliveHero && aliveHero.id !== selectedHeroId) {
      setSelectedHeroId(aliveHero.id);
    }
  }, [combat.heroes, selectedHeroId]);

  // Auto-select first alive enemy
  useEffect(() => {
    const aliveEnemy = combat.enemies.find(e => !e.isDead);
    if (aliveEnemy && aliveEnemy.id !== selectedEnemyId) {
      setSelectedEnemyId(aliveEnemy.id);
    }
  }, [combat.enemies, selectedEnemyId]);

  // Check battle end
  useEffect(() => {
    if (combat.phase === 'victory' || combat.phase === 'defeat') {
      const rewards = calculateRewards(combat, enemies[0].loot);
      const result = createCombatResult(combat, enemies[0].displayName, rewards);
      recordCombat(result);
      
      setTimeout(() => {
        onBattleEnd(combat.phase === 'victory');
      }, 2000);
    }
  }, [combat.phase]);

  const handleAttack = () => {
    if (isProcessing || !selectedHeroId || !selectedEnemyId) return;
    
    setIsProcessing(true);
    
    // Hero attacks
    let newCombat = processHeroTurn(combat, selectedHeroId, 'attack', selectedEnemyId);
    setCombat(newCombat);
    
    // Enemy counter-attack
    setTimeout(() => {
      const aliveEnemies = newCombat.enemies.filter(e => !e.isDead);
      if (aliveEnemies.length > 0) {
        const enemyId = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].id;
        newCombat = processEnemyTurn(newCombat, enemyId);
        setCombat(newCombat);
      }
      
      // Next turn
      setTimeout(() => {
        setCombat(nextTurn(newCombat));
        setIsProcessing(false);
      }, 500);
    }, 1000);
  };

  const handleSkill = (skillId: string) => {
    if (isProcessing || !selectedHeroId || !selectedEnemyId) return;
    
    setIsProcessing(true);
    setSelectedSkillId(skillId);
    
    // Hero uses skill
    let newCombat = processHeroTurn(combat, selectedHeroId, 'skill', selectedEnemyId, skillId);
    setCombat(newCombat);
    
    // Enemy counter-attack
    setTimeout(() => {
      const aliveEnemies = newCombat.enemies.filter(e => !e.isDead);
      if (aliveEnemies.length > 0) {
        const enemyId = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].id;
        newCombat = processEnemyTurn(newCombat, enemyId);
        setCombat(newCombat);
      }
      
      // Next turn
      setTimeout(() => {
        setCombat(nextTurn(newCombat));
        setSelectedSkillId(null);
        setIsProcessing(false);
      }, 500);
    }, 1000);
  };

  const selectedHero = combat.heroes.find(h => h.id === selectedHeroId);
  const selectedEnemy = combat.enemies.find(e => e.id === selectedEnemyId);

  // Battle end screen
  if (combat.phase === 'victory' || combat.phase === 'defeat') {
    const rewards = calculateRewards(combat, enemies[0].loot);
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
        >
          {combat.phase === 'victory' ? (
            <>
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-4">Chiến Thắng!</h2>
              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <p className="font-semibold mb-2">Phần Thưởng:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>💰 {rewards.gold} Vàng</div>
                  <div>🌾 {rewards.rice} Lúa</div>
                  <div>🪵 {rewards.lumber} Gỗ</div>
                  <div>🪨 {rewards.stone} Đá</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💀</span>
              </div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">Thất Bại!</h2>
              <p className="text-gray-600 mb-4">Đội quân của bạn đã bị đánh bại...</p>
            </>
          )}
          
          <button
            onClick={onExit}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold"
          >
            Quay Lại
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="p-2 rounded-lg bg-slate-800 text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="text-white font-bold">Lượt {combat.turn}/{combat.maxTurns}</div>
            <div className="text-xs text-slate-400">Trận Chiến</div>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 pb-32">
        {/* Enemies Section */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Sword className="w-5 h-5 text-red-500" />
            Kẻ Địch
          </h3>
          
          <div className="space-y-3">
            {combat.enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                layout
                onClick={() => !enemy.isDead && setSelectedEnemyId(enemy.id)}
                className={`
                  bg-gradient-to-r from-red-900 to-red-800 rounded-xl p-4
                  border-2 transition-all
                  ${enemy.isDead ? 'opacity-30 grayscale' : ''}
                  ${selectedEnemyId === enemy.id ? 'border-yellow-400 shadow-lg shadow-yellow-500/50' : 'border-red-700'}
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold">{enemy.displayName}</h4>
                      <ElementBadge element={enemy.element} size="sm" />
                      <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded">
                        Lv.{enemy.level}
                      </span>
                    </div>
                    {selectedHero && (
                      <ElementCounterDisplay 
                        attackerElement={selectedHero.element}
                        defenderElement={enemy.element}
                      />
                    )}
                  </div>
                </div>
                
                {/* HP Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-red-200">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      HP
                    </span>
                    <span>{enemy.currentHp}/{enemy.maxHp}</span>
                  </div>
                  <div className="h-3 bg-red-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                      className="h-full bg-gradient-to-r from-red-500 to-red-400"
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-red-200">
                  <div className="flex items-center gap-1">
                    <Sword className="w-3 h-3" />
                    Tấn: {enemy.attack}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Thủ: {enemy.defense}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Heroes Section */}
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Anh Hùng
          </h3>
          
          <div className="space-y-3">
            {combat.heroes.map(hero => (
              <motion.div
                key={hero.id}
                layout
                onClick={() => !hero.isDead && setSelectedHeroId(hero.id)}
                className={`
                  bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-4
                  border-2 transition-all
                  ${hero.isDead ? 'opacity-30 grayscale' : ''}
                  ${selectedHeroId === hero.id ? 'border-yellow-400 shadow-lg shadow-yellow-500/50' : 'border-blue-700'}
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold">{hero.displayName}</h4>
                      <ElementBadge element={hero.element} size="sm" />
                      <span className="text-xs bg-blue-950 text-blue-300 px-2 py-0.5 rounded">
                        Lv.{hero.level}
                      </span>
                    </div>
                    <p className="text-xs text-blue-300">{hero.title}</p>
                  </div>
                </div>
                
                {/* HP Bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      HP
                    </span>
                    <span>{hero.currentHp}/{hero.stats.maxHp}</span>
                  </div>
                  <div className="h-3 bg-blue-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: `${(hero.currentHp / hero.stats.maxHp) * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    />
                  </div>
                </div>
                
                {/* Mana Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Mana
                    </span>
                    <span>{hero.currentMana}/{hero.maxMana}</span>
                  </div>
                  <div className="h-2 bg-blue-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                      style={{ width: `${(hero.currentMana / hero.maxMana) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Skills */}
                {selectedHeroId === hero.id && !hero.isDead && (
                  <div className="grid grid-cols-2 gap-2">
                    {hero.skills.slice(0, 2).map(skill => {
                      const cooldown = hero.skillCooldowns.get(skill.id) || 0;
                      const isOnCooldown = cooldown > 0;
                      
                      return (
                        <button
                          key={skill.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOnCooldown && !isProcessing) {
                              handleSkill(skill.id);
                            }
                          }}
                          disabled={isOnCooldown || isProcessing}
                          className={`
                            p-2 rounded-lg text-xs font-semibold
                            transition-all
                            ${isOnCooldown || isProcessing
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white active:scale-95'
                            }
                          `}
                        >
                          <div>{skill.name}</div>
                          {isOnCooldown && (
                            <div className="text-xs mt-1">CD: {cooldown}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4">
        <button
          onClick={handleAttack}
          disabled={isProcessing || !selectedHeroId || !selectedEnemyId}
          className={`
            w-full py-4 rounded-xl font-bold text-lg
            flex items-center justify-center gap-2
            transition-all
            ${isProcessing || !selectedHeroId || !selectedEnemyId
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-red-500 text-white active:scale-95 shadow-lg'
            }
          `}
          style={{ minHeight: touchTargets.comfortable }}
        >
          <Sword className="w-6 h-6" />
          {isProcessing ? 'Đang Tấn Công...' : 'Tấn Công'}
        </button>
      </div>
    </div>
  );
}
