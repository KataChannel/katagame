// Advanced Guild Wars System - Territory Wars, Siege Mechanics, Alliances
// MVP 4 - Feature #3

export type TerritoryType = 'castle' | 'fortress' | 'outpost' | 'mine' | 'farm' | 'temple' | 'port';
export type TerritoryStatus = 'neutral' | 'occupied' | 'contested' | 'siege';
export type WarStatus = 'scheduled' | 'preparation' | 'active' | 'completed' | 'cancelled';
export type AllianceStatus = 'pending' | 'active' | 'expired' | 'broken';
export type SiegeTroopType = 'infantry' | 'archer' | 'cavalry' | 'siege_weapon' | 'mage' | 'healer';
export type GuildBuffType = 'attack' | 'defense' | 'resource' | 'experience' | 'gold' | 'critical';

export interface Territory {
  id: string;
  name: string;
  type: TerritoryType;
  status: TerritoryStatus;
  ownerGuildId: string | null;
  ownerGuildName: string | null;
  location: { x: number; y: number };
  level: number;
  defenseRating: number;
  resourceGeneration: {
    gold: number;
    gems: number;
    experience: number;
  };
  bonuses: {
    type: string;
    value: number;
  }[];
  capturedAt: number | null;
  lastAttackAt: number | null;
  siegeCount: number;
}

export interface GuildWarDeclaration {
  id: string;
  attackerGuildId: string;
  attackerGuildName: string;
  defenderGuildId: string;
  defenderGuildName: string;
  targetTerritoryId: string;
  status: WarStatus;
  scheduledTime: number;
  startTime: number | null;
  endTime: number | null;
  preparationTimeMinutes: number;
  duration: number;
  
  // Participants
  attackerMembers: string[];
  defenderMembers: string[];
  
  // Victory conditions
  victorGuildId: string | null;
  attackerScore: number;
  defenderScore: number;
  
  // Rewards
  rewards: {
    winner: {
      gold: number;
      gems: number;
      guildPoints: number;
      territoryControl?: boolean;
    };
    loser: {
      gold: number;
      guildPoints: number;
    };
  };
}

export interface SiegeTroop {
  id: string;
  type: SiegeTroopType;
  playerId: string;
  playerName: string;
  guildId: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  specialAbility: string | null;
  isAlive: boolean;
  kills: number;
  damageDealt: number;
  damageTaken: number;
}

export interface SiegeBattle {
  warId: string;
  territoryId: string;
  attackerTroops: Map<string, SiegeTroop>;
  defenderTroops: Map<string, SiegeTroop>;
  fortifications: {
    walls: { health: number; maxHealth: number; position: number }[];
    towers: { health: number; maxHealth: number; attack: number; position: number }[];
    gates: { health: number; maxHealth: number; position: number }[];
  };
  battleLog: {
    timestamp: number;
    event: string;
    details: any;
  }[];
  phase: 'deployment' | 'assault' | 'breach' | 'capture' | 'defend';
}

export interface GuildAlliance {
  id: string;
  guildId1: string;
  guildName1: string;
  guildId2: string;
  guildName2: string;
  status: AllianceStatus;
  proposedBy: string;
  proposedAt: number;
  acceptedAt: number | null;
  expiresAt: number;
  benefits: {
    sharedTerritory: boolean;
    mutualDefense: boolean;
    tradeBonus: number;
    jointAttacks: boolean;
  };
  allianceWarCount: number;
  totalContribution: {
    guild1: number;
    guild2: number;
  };
}

export interface GuildRanking {
  guildId: string;
  guildName: string;
  rank: number;
  previousRank: number;
  points: number;
  territoriesOwned: number;
  warsWon: number;
  warsLost: number;
  totalMembers: number;
  activeMembers: number;
  averagePower: number;
  winRate: number;
  season: string;
}

export interface GuildShopItem {
  id: string;
  name: string;
  description: string;
  category: 'buff' | 'troop' | 'fortification' | 'resource' | 'cosmetic';
  cost: {
    guildPoints: number;
    gold?: number;
    gems?: number;
  };
  requiredGuildLevel: number;
  requiredRank?: number;
  stock: number;
  maxPurchasePerWeek: number;
  effect: any;
}

export interface GuildQuest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  objectives: {
    type: string;
    description: string;
    current: number;
    required: number;
    completed: boolean;
  }[];
  rewards: {
    guildPoints: number;
    gold: number;
    gems?: number;
    guildExp: number;
  };
  startTime: number;
  expiresAt: number;
  completed: boolean;
  participatingMembers: string[];
}

export interface GuildTreasury {
  guildId: string;
  gold: number;
  gems: number;
  guildPoints: number;
  resources: Map<string, number>;
  
  // Donation tracking
  totalDonations: number;
  weeklyDonations: Map<string, number>; // playerId -> amount
  topDonors: {
    playerId: string;
    playerName: string;
    totalDonated: number;
    weeklyDonated: number;
  }[];
  
  // Spending
  weeklySpending: {
    buffs: number;
    shop: number;
    wars: number;
    upgrades: number;
  };
}

export interface GuildBuff {
  id: string;
  type: GuildBuffType;
  name: string;
  description: string;
  value: number;
  duration: number;
  activatedAt: number;
  expiresAt: number;
  activatedBy: string;
  cost: number;
  affectsAllMembers: boolean;
}

export interface GuildWarStats {
  guildId: string;
  totalWars: number;
  warsWon: number;
  warsLost: number;
  territoriesConquered: number;
  territoriesLost: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  mvpPlayers: {
    playerId: string;
    playerName: string;
    contributions: number;
  }[];
  lastWarAt: number;
}

// Configuration
export const GUILD_WARS_CONFIG = {
  // War Settings
  MIN_GUILD_LEVEL_FOR_WARS: 3,
  MIN_MEMBERS_TO_DECLARE_WAR: 5,
  MAX_ACTIVE_WARS_PER_GUILD: 3,
  PREPARATION_TIME_HOURS: 24,
  WAR_DURATION_HOURS: 2,
  COOLDOWN_BETWEEN_WARS_HOURS: 12,
  
  // Territory Settings
  TOTAL_TERRITORIES: 50,
  STARTING_NEUTRAL_TERRITORIES: 30,
  TERRITORY_DEFENSE_MULTIPLIER: 1.5,
  TERRITORY_CAPTURE_SCORE_REQUIRED: 10000,
  
  // Siege Settings
  MAX_TROOPS_PER_PLAYER: 5,
  MAX_TOTAL_TROOPS_PER_SIDE: 50,
  TROOP_DEPLOYMENT_TIME_SECONDS: 300, // 5 minutes
  WALL_HEALTH_MULTIPLIER: 2.0,
  GATE_HEALTH_MULTIPLIER: 1.5,
  TOWER_DAMAGE_PER_SECOND: 100,
  
  // Alliance Settings
  MAX_ALLIANCES: 3,
  ALLIANCE_DURATION_DAYS: 30,
  ALLIANCE_PROPOSAL_EXPIRY_HOURS: 48,
  MUTUAL_DEFENSE_COOLDOWN_HOURS: 6,
  
  // Rewards
  WAR_VICTORY_GOLD: 50000,
  WAR_VICTORY_GEMS: 500,
  WAR_VICTORY_GUILD_POINTS: 1000,
  WAR_DEFEAT_CONSOLATION_GOLD: 10000,
  WAR_DEFEAT_GUILD_POINTS: 200,
  TERRITORY_DAILY_GOLD_BASE: 5000,
  TERRITORY_DAILY_GEMS_BASE: 50,
  
  // Ranking
  RANK_UPDATE_INTERVAL_HOURS: 6,
  TOP_GUILDS_DISPLAY: 100,
  SEASON_DURATION_DAYS: 90,
  
  // Shop & Buffs
  BUFF_DURATION_HOURS: 24,
  MAX_ACTIVE_BUFFS: 5,
  SHOP_REFRESH_INTERVAL_HOURS: 168, // Weekly
};

class GuildWarsSystem {
  private static instance: GuildWarsSystem;
  
  private territories: Map<string, Territory> = new Map();
  private warDeclarations: Map<string, GuildWarDeclaration> = new Map();
  private siegeBattles: Map<string, SiegeBattle> = new Map();
  private alliances: Map<string, GuildAlliance> = new Map();
  private rankings: Map<string, GuildRanking> = new Map();
  private guildShop: Map<string, GuildShopItem> = new Map();
  private guildQuests: Map<string, GuildQuest> = new Map();
  private guildTreasuries: Map<string, GuildTreasury> = new Map();
  private guildBuffs: Map<string, GuildBuff[]> = new Map();
  private warStats: Map<string, GuildWarStats> = new Map();
  
  private constructor() {
    this.initializeTerritories();
    this.initializeShop();
    this.startBackgroundProcesses();
  }
  
  public static getGuildWarsSystem(): GuildWarsSystem {
    if (!GuildWarsSystem.instance) {
      GuildWarsSystem.instance = new GuildWarsSystem();
    }
    return GuildWarsSystem.instance;
  }
  
  // ============ TERRITORY MANAGEMENT ============
  
  private initializeTerritories() {
    const territoryTypes: TerritoryType[] = ['castle', 'fortress', 'outpost', 'mine', 'farm', 'temple', 'port'];
    const territoryNames = [
      'Thăng Long Citadel', 'Hue Imperial City', 'Saigon Fortress', 'Hanoi Castle',
      'Da Nang Port', 'Nha Trang Bay', 'Hoi An Trading Post', 'Can Tho Delta',
      'Hai Phong Harbor', 'Vung Tau Coast', 'Phu Quoc Island', 'Cat Ba Stronghold',
      'Sapa Mountains', 'Ha Long Bay', 'Mekong Delta', 'Phong Nha Cave',
      'Ba Na Hills', 'Fansipan Peak', 'Cu Chi Tunnels', 'Tam Coc Valley',
      'Ninh Binh Fortress', 'Quy Nhon Port', 'Mui Ne Desert', 'Dalat Highlands',
      'Kon Tum Mountains', 'Dien Bien Fort', 'Lang Son Border', 'Cao Bang Peaks',
      'Ha Giang Loop', 'Mai Chau Valley', 'Pu Luong Reserve', 'Ba Be Lake',
      'Cuc Phuong Forest', 'Trang An Complex', 'Bai Tu Long Bay', 'Co To Island',
      'Ly Son Island', 'Con Dao Prison', 'Nam Du Archipelago', 'An Giang Temple',
      'Tra Vinh Pagoda', 'Soc Trang Monastery', 'Bac Lieu Manor', 'Ca Mau Point',
      'Rach Gia Port', 'Phan Thiet Beach', 'Binh Thuan Dunes', 'Lam Dong Plateau',
      'Dak Lak Coffee', 'Gia Lai Highlands',
    ];
    
    for (let i = 0; i < GUILD_WARS_CONFIG.TOTAL_TERRITORIES; i++) {
      const type = territoryTypes[i % territoryTypes.length];
      const territory: Territory = {
        id: `territory_${i + 1}`,
        name: territoryNames[i] || `Territory ${i + 1}`,
        type,
        status: 'neutral',
        ownerGuildId: null,
        ownerGuildName: null,
        location: {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        },
        level: Math.floor(Math.random() * 5) + 1,
        defenseRating: Math.floor(Math.random() * 5000) + 1000,
        resourceGeneration: this.calculateResourceGeneration(type),
        bonuses: this.generateTerritoryBonuses(type),
        capturedAt: null,
        lastAttackAt: null,
        siegeCount: 0,
      };
      
      this.territories.set(territory.id, territory);
    }
  }
  
  private calculateResourceGeneration(type: TerritoryType) {
    const baseRates = {
      castle: { gold: 10000, gems: 100, experience: 5000 },
      fortress: { gold: 7000, gems: 70, experience: 3500 },
      outpost: { gold: 3000, gems: 30, experience: 1500 },
      mine: { gold: 5000, gems: 150, experience: 1000 },
      farm: { gold: 8000, gems: 20, experience: 2000 },
      temple: { gold: 4000, gems: 80, experience: 8000 },
      port: { gold: 12000, gems: 50, experience: 2500 },
    };
    
    return baseRates[type] || { gold: 5000, gems: 50, experience: 2500 };
  }
  
  private generateTerritoryBonuses(type: TerritoryType) {
    const bonuses: { type: string; value: number }[] = [];
    
    switch (type) {
      case 'castle':
        bonuses.push({ type: 'guild_max_members', value: 10 });
        bonuses.push({ type: 'defense_bonus', value: 20 });
        break;
      case 'fortress':
        bonuses.push({ type: 'troop_defense', value: 15 });
        bonuses.push({ type: 'wall_health', value: 25 });
        break;
      case 'mine':
        bonuses.push({ type: 'gem_generation', value: 50 });
        break;
      case 'farm':
        bonuses.push({ type: 'gold_generation', value: 30 });
        break;
      case 'temple':
        bonuses.push({ type: 'experience_bonus', value: 40 });
        break;
      case 'port':
        bonuses.push({ type: 'trade_bonus', value: 25 });
        break;
    }
    
    return bonuses;
  }
  
  public getTerritories(): Territory[] {
    return Array.from(this.territories.values());
  }
  
  public getTerritory(territoryId: string): Territory | null {
    return this.territories.get(territoryId) || null;
  }
  
  public getGuildTerritories(guildId: string): Territory[] {
    return Array.from(this.territories.values()).filter(
      t => t.ownerGuildId === guildId
    );
  }
  
  // ============ WAR DECLARATION ============
  
  public declareWar(
    attackerGuildId: string,
    attackerGuildName: string,
    defenderGuildId: string,
    defenderGuildName: string,
    targetTerritoryId: string
  ): { success: boolean; error?: string; war?: GuildWarDeclaration } {
    // Validation
    const activeWars = Array.from(this.warDeclarations.values()).filter(
      w => (w.attackerGuildId === attackerGuildId || w.defenderGuildId === attackerGuildId) &&
           w.status !== 'completed' && w.status !== 'cancelled'
    );
    
    if (activeWars.length >= GUILD_WARS_CONFIG.MAX_ACTIVE_WARS_PER_GUILD) {
      return { success: false, error: 'Maximum active wars reached' };
    }
    
    const territory = this.territories.get(targetTerritoryId);
    if (!territory) {
      return { success: false, error: 'Territory not found' };
    }
    
    if (territory.ownerGuildId === attackerGuildId) {
      return { success: false, error: 'Cannot attack your own territory' };
    }
    
    // Check cooldown
    const guildStats = this.warStats.get(attackerGuildId);
    if (guildStats && guildStats.lastWarAt) {
      const hoursSinceLastWar = (Date.now() - guildStats.lastWarAt) / (1000 * 60 * 60);
      if (hoursSinceLastWar < GUILD_WARS_CONFIG.COOLDOWN_BETWEEN_WARS_HOURS) {
        return { success: false, error: `War cooldown: ${Math.ceil(GUILD_WARS_CONFIG.COOLDOWN_BETWEEN_WARS_HOURS - hoursSinceLastWar)}h remaining` };
      }
    }
    
    const scheduledTime = Date.now() + (GUILD_WARS_CONFIG.PREPARATION_TIME_HOURS * 60 * 60 * 1000);
    const duration = GUILD_WARS_CONFIG.WAR_DURATION_HOURS * 60 * 60 * 1000;
    
    const war: GuildWarDeclaration = {
      id: `war_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attackerGuildId,
      attackerGuildName,
      defenderGuildId,
      defenderGuildName,
      targetTerritoryId,
      status: 'scheduled',
      scheduledTime,
      startTime: null,
      endTime: null,
      preparationTimeMinutes: GUILD_WARS_CONFIG.PREPARATION_TIME_HOURS * 60,
      duration,
      attackerMembers: [],
      defenderMembers: [],
      victorGuildId: null,
      attackerScore: 0,
      defenderScore: 0,
      rewards: {
        winner: {
          gold: GUILD_WARS_CONFIG.WAR_VICTORY_GOLD,
          gems: GUILD_WARS_CONFIG.WAR_VICTORY_GEMS,
          guildPoints: GUILD_WARS_CONFIG.WAR_VICTORY_GUILD_POINTS,
          territoryControl: true,
        },
        loser: {
          gold: GUILD_WARS_CONFIG.WAR_DEFEAT_CONSOLATION_GOLD,
          guildPoints: GUILD_WARS_CONFIG.WAR_DEFEAT_GUILD_POINTS,
        },
      },
    };
    
    this.warDeclarations.set(war.id, war);
    
    // Update territory status
    territory.status = 'contested';
    
    return { success: true, war };
  }
  
  public joinWar(warId: string, playerId: string, side: 'attacker' | 'defender'): { success: boolean; error?: string } {
    const war = this.warDeclarations.get(warId);
    if (!war) {
      return { success: false, error: 'War not found' };
    }
    
    if (war.status !== 'scheduled' && war.status !== 'preparation') {
      return { success: false, error: 'War already started or ended' };
    }
    
    const members = side === 'attacker' ? war.attackerMembers : war.defenderMembers;
    
    if (members.includes(playerId)) {
      return { success: false, error: 'Already joined' };
    }
    
    if (members.length >= GUILD_WARS_CONFIG.MAX_TOTAL_TROOPS_PER_SIDE / GUILD_WARS_CONFIG.MAX_TROOPS_PER_PLAYER) {
      return { success: false, error: 'Side is full' };
    }
    
    members.push(playerId);
    
    return { success: true };
  }
  
  public startWar(warId: string): { success: boolean; error?: string } {
    const war = this.warDeclarations.get(warId);
    if (!war) {
      return { success: false, error: 'War not found' };
    }
    
    if (Date.now() < war.scheduledTime) {
      return { success: false, error: 'War not ready to start' };
    }
    
    war.status = 'active';
    war.startTime = Date.now();
    war.endTime = Date.now() + war.duration;
    
    // Initialize siege battle
    this.initializeSiegeBattle(war);
    
    // Update territory
    const territory = this.territories.get(war.targetTerritoryId);
    if (territory) {
      territory.status = 'siege';
      territory.lastAttackAt = Date.now();
      territory.siegeCount++;
    }
    
    return { success: true };
  }
  
  // ============ SIEGE MECHANICS ============
  
  private initializeSiegeBattle(war: GuildWarDeclaration) {
    const territory = this.territories.get(war.targetTerritoryId);
    if (!territory) return;
    
    const siegeBattle: SiegeBattle = {
      warId: war.id,
      territoryId: war.targetTerritoryId,
      attackerTroops: new Map(),
      defenderTroops: new Map(),
      fortifications: {
        walls: [
          { health: 10000 * territory.level, maxHealth: 10000 * territory.level, position: 0 },
          { health: 10000 * territory.level, maxHealth: 10000 * territory.level, position: 1 },
          { health: 10000 * territory.level, maxHealth: 10000 * territory.level, position: 2 },
        ],
        towers: [
          { health: 5000 * territory.level, maxHealth: 5000 * territory.level, attack: GUILD_WARS_CONFIG.TOWER_DAMAGE_PER_SECOND, position: 0 },
          { health: 5000 * territory.level, maxHealth: 5000 * territory.level, attack: GUILD_WARS_CONFIG.TOWER_DAMAGE_PER_SECOND, position: 1 },
        ],
        gates: [
          { health: 8000 * territory.level, maxHealth: 8000 * territory.level, position: 1 },
        ],
      },
      battleLog: [],
      phase: 'deployment',
    };
    
    this.siegeBattles.set(war.id, siegeBattle);
  }
  
  public deployTroop(
    warId: string,
    playerId: string,
    playerName: string,
    guildId: string,
    troopType: SiegeTroopType,
    position: { x: number; y: number }
  ): { success: boolean; error?: string; troop?: SiegeTroop } {
    const siege = this.siegeBattles.get(warId);
    if (!siege) {
      return { success: false, error: 'Siege battle not found' };
    }
    
    const war = this.warDeclarations.get(warId);
    if (!war) {
      return { success: false, error: 'War not found' };
    }
    
    const isAttacker = guildId === war.attackerGuildId;
    const troops = isAttacker ? siege.attackerTroops : siege.defenderTroops;
    
    // Check troop limit per player
    const playerTroops = Array.from(troops.values()).filter(t => t.playerId === playerId);
    if (playerTroops.length >= GUILD_WARS_CONFIG.MAX_TROOPS_PER_PLAYER) {
      return { success: false, error: 'Maximum troops per player reached' };
    }
    
    const troopStats = this.getTroopStats(troopType);
    
    const troop: SiegeTroop = {
      id: `troop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: troopType,
      playerId,
      playerName,
      guildId,
      position,
      health: troopStats.health,
      maxHealth: troopStats.health,
      attack: troopStats.attack,
      defense: troopStats.defense,
      speed: troopStats.speed,
      range: troopStats.range,
      specialAbility: troopStats.specialAbility,
      isAlive: true,
      kills: 0,
      damageDealt: 0,
      damageTaken: 0,
    };
    
    troops.set(troop.id, troop);
    
    siege.battleLog.push({
      timestamp: Date.now(),
      event: 'troop_deployed',
      details: { playerId, playerName, troopType, position },
    });
    
    return { success: true, troop };
  }
  
  private getTroopStats(type: SiegeTroopType) {
    const stats = {
      infantry: { health: 1000, attack: 150, defense: 100, speed: 5, range: 1, specialAbility: 'shield_wall' },
      archer: { health: 600, attack: 120, defense: 50, speed: 6, range: 8, specialAbility: 'volley' },
      cavalry: { health: 800, attack: 200, defense: 80, speed: 10, range: 2, specialAbility: 'charge' },
      siege_weapon: { health: 500, attack: 500, defense: 30, speed: 2, range: 12, specialAbility: 'demolish' },
      mage: { health: 400, attack: 250, defense: 40, speed: 4, range: 10, specialAbility: 'fireball' },
      healer: { health: 500, attack: 50, defense: 60, speed: 5, range: 6, specialAbility: 'heal' },
    };
    
    return stats[type] || stats.infantry;
  }
  
  public getSiegeBattle(warId: string): SiegeBattle | null {
    return this.siegeBattles.get(warId) || null;
  }
  
  public processSiegeTurn(warId: string): { success: boolean; events: any[] } {
    const siege = this.siegeBattles.get(warId);
    const war = this.warDeclarations.get(warId);
    
    if (!siege || !war) {
      return { success: false, events: [] };
    }
    
    const events: any[] = [];
    
    // Process troop movements and attacks
    // This is a simplified version - full implementation would include pathfinding, combat resolution, etc.
    
    // Attackers deal damage to fortifications
    siege.attackerTroops.forEach(troop => {
      if (!troop.isAlive) return;
      
      if (troop.type === 'siege_weapon') {
        const gate = siege.fortifications.gates[0];
        if (gate && gate.health > 0) {
          const damage = troop.attack;
          gate.health = Math.max(0, gate.health - damage);
          troop.damageDealt += damage;
          
          events.push({
            type: 'fortification_damage',
            attacker: troop.id,
            target: 'gate',
            damage,
          });
          
          if (gate.health === 0) {
            siege.phase = 'breach';
            events.push({ type: 'gate_destroyed' });
          }
        }
      }
    });
    
    // Towers attack attacker troops
    siege.fortifications.towers.forEach(tower => {
      if (tower.health <= 0) return;
      
      const targets = Array.from(siege.attackerTroops.values()).filter(t => t.isAlive);
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const damage = Math.max(0, tower.attack - target.defense);
        target.health = Math.max(0, target.health - damage);
        target.damageTaken += damage;
        
        if (target.health === 0) {
          target.isAlive = false;
          events.push({ type: 'troop_killed', troopId: target.id });
        }
      }
    });
    
    // Calculate scores
    war.attackerScore = this.calculateSiegeScore(siege, 'attacker');
    war.defenderScore = this.calculateSiegeScore(siege, 'defender');
    
    return { success: true, events };
  }
  
  private calculateSiegeScore(siege: SiegeBattle, side: 'attacker' | 'defender'): number {
    let score = 0;
    
    const troops = side === 'attacker' ? siege.attackerTroops : siege.defenderTroops;
    
    troops.forEach(troop => {
      score += troop.damageDealt;
      score += troop.kills * 500;
      if (troop.isAlive) score += 1000;
    });
    
    if (side === 'attacker') {
      // Bonus for destroying fortifications
      siege.fortifications.gates.forEach(gate => {
        if (gate.health === 0) score += 5000;
      });
      siege.fortifications.walls.forEach(wall => {
        score += (wall.maxHealth - wall.health) / 10;
      });
    } else {
      // Bonus for defending fortifications
      siege.fortifications.gates.forEach(gate => {
        score += gate.health / 10;
      });
    }
    
    return Math.floor(score);
  }
  
  public endWar(warId: string): { success: boolean; victor?: string } {
    const war = this.warDeclarations.get(warId);
    if (!war) {
      return { success: false };
    }
    
    war.status = 'completed';
    war.endTime = Date.now();
    
    // Determine victor
    const victorGuildId = war.attackerScore > war.defenderScore ? war.attackerGuildId : war.defenderGuildId;
    war.victorGuildId = victorGuildId;
    
    // Transfer territory if attacker wins
    if (victorGuildId === war.attackerGuildId) {
      const territory = this.territories.get(war.targetTerritoryId);
      if (territory) {
        territory.ownerGuildId = war.attackerGuildId;
        territory.ownerGuildName = war.attackerGuildName;
        territory.status = 'occupied';
        territory.capturedAt = Date.now();
      }
    }
    
    // Update stats
    this.updateWarStats(war);
    
    return { success: true, victor: victorGuildId };
  }
  
  private updateWarStats(war: GuildWarDeclaration) {
    const updateGuildStats = (guildId: string, won: boolean) => {
      let stats = this.warStats.get(guildId);
      if (!stats) {
        stats = {
          guildId,
          totalWars: 0,
          warsWon: 0,
          warsLost: 0,
          territoriesConquered: 0,
          territoriesLost: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          mvpPlayers: [],
          lastWarAt: Date.now(),
        };
        this.warStats.set(guildId, stats);
      }
      
      stats.totalWars++;
      if (won) {
        stats.warsWon++;
        if (guildId === war.attackerGuildId) stats.territoriesConquered++;
      } else {
        stats.warsLost++;
        if (guildId === war.defenderGuildId) stats.territoriesLost++;
      }
      stats.lastWarAt = Date.now();
    };
    
    updateGuildStats(war.attackerGuildId, war.victorGuildId === war.attackerGuildId);
    updateGuildStats(war.defenderGuildId, war.victorGuildId === war.defenderGuildId);
  }
  
  // ============ ALLIANCE SYSTEM ============
  
  public proposeAlliance(
    guildId1: string,
    guildName1: string,
    guildId2: string,
    guildName2: string,
    proposedBy: string
  ): { success: boolean; error?: string; alliance?: GuildAlliance } {
    // Check max alliances
    const existingAlliances = Array.from(this.alliances.values()).filter(
      a => (a.guildId1 === guildId1 || a.guildId2 === guildId1) && a.status === 'active'
    );
    
    if (existingAlliances.length >= GUILD_WARS_CONFIG.MAX_ALLIANCES) {
      return { success: false, error: 'Maximum alliances reached' };
    }
    
    const alliance: GuildAlliance = {
      id: `alliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      guildId1,
      guildName1,
      guildId2,
      guildName2,
      status: 'pending',
      proposedBy,
      proposedAt: Date.now(),
      acceptedAt: null,
      expiresAt: Date.now() + (GUILD_WARS_CONFIG.ALLIANCE_DURATION_DAYS * 24 * 60 * 60 * 1000),
      benefits: {
        sharedTerritory: true,
        mutualDefense: true,
        tradeBonus: 10,
        jointAttacks: true,
      },
      allianceWarCount: 0,
      totalContribution: {
        guild1: 0,
        guild2: 0,
      },
    };
    
    this.alliances.set(alliance.id, alliance);
    
    return { success: true, alliance };
  }
  
  public acceptAlliance(allianceId: string): { success: boolean; error?: string } {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) {
      return { success: false, error: 'Alliance not found' };
    }
    
    if (alliance.status !== 'pending') {
      return { success: false, error: 'Alliance not pending' };
    }
    
    alliance.status = 'active';
    alliance.acceptedAt = Date.now();
    
    return { success: true };
  }
  
  public getAlliances(guildId: string): GuildAlliance[] {
    return Array.from(this.alliances.values()).filter(
      a => (a.guildId1 === guildId || a.guildId2 === guildId) && a.status === 'active'
    );
  }
  
  // ============ GUILD SHOP ============
  
  private initializeShop() {
    const items: GuildShopItem[] = [
      {
        id: 'buff_attack',
        name: 'Guild Attack Buff',
        description: '+20% attack for all members (24h)',
        category: 'buff',
        cost: { guildPoints: 5000, gold: 50000 },
        requiredGuildLevel: 5,
        stock: -1,
        maxPurchasePerWeek: 3,
        effect: { type: 'attack', value: 20, duration: 86400000 },
      },
      {
        id: 'buff_defense',
        name: 'Guild Defense Buff',
        description: '+20% defense for all members (24h)',
        category: 'buff',
        cost: { guildPoints: 5000, gold: 50000 },
        requiredGuildLevel: 5,
        stock: -1,
        maxPurchasePerWeek: 3,
        effect: { type: 'defense', value: 20, duration: 86400000 },
      },
      {
        id: 'buff_gold',
        name: 'Gold Generation Buff',
        description: '+30% gold generation (24h)',
        category: 'buff',
        cost: { guildPoints: 3000, gold: 30000 },
        requiredGuildLevel: 3,
        stock: -1,
        maxPurchasePerWeek: 5,
        effect: { type: 'gold', value: 30, duration: 86400000 },
      },
      {
        id: 'troop_elite_infantry',
        name: 'Elite Infantry Unit',
        description: 'Deploy elite infantry in wars (+50% stats)',
        category: 'troop',
        cost: { guildPoints: 2000, gold: 20000 },
        requiredGuildLevel: 4,
        stock: 10,
        maxPurchasePerWeek: 5,
        effect: { type: 'elite_troop', troopType: 'infantry', multiplier: 1.5 },
      },
      {
        id: 'fortification_wall_upgrade',
        name: 'Fortification Upgrade',
        description: '+25% wall health for territory defense',
        category: 'fortification',
        cost: { guildPoints: 10000, gold: 100000 },
        requiredGuildLevel: 6,
        stock: 3,
        maxPurchasePerWeek: 1,
        effect: { type: 'wall_health', value: 25 },
      },
    ];
    
    items.forEach(item => this.guildShop.set(item.id, item));
  }
  
  public getGuildShop(): GuildShopItem[] {
    return Array.from(this.guildShop.values());
  }
  
  public purchaseShopItem(
    guildId: string,
    itemId: string,
    playerId: string
  ): { success: boolean; error?: string } {
    const item = this.guildShop.get(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    
    const treasury = this.guildTreasuries.get(guildId);
    if (!treasury) {
      return { success: false, error: 'Treasury not found' };
    }
    
    // Check resources
    if (treasury.guildPoints < item.cost.guildPoints) {
      return { success: false, error: 'Insufficient guild points' };
    }
    
    if (item.cost.gold && treasury.gold < item.cost.gold) {
      return { success: false, error: 'Insufficient gold' };
    }
    
    // Deduct cost
    treasury.guildPoints -= item.cost.guildPoints;
    if (item.cost.gold) treasury.gold -= item.cost.gold;
    
    // Apply effect (simplified)
    if (item.category === 'buff') {
      this.activateGuildBuff(guildId, item, playerId);
    }
    
    return { success: true };
  }
  
  private activateGuildBuff(guildId: string, item: GuildShopItem, activatedBy: string) {
    const buff: GuildBuff = {
      id: `buff_${Date.now()}`,
      type: item.effect.type,
      name: item.name,
      description: item.description,
      value: item.effect.value,
      duration: item.effect.duration,
      activatedAt: Date.now(),
      expiresAt: Date.now() + item.effect.duration,
      activatedBy,
      cost: item.cost.guildPoints,
      affectsAllMembers: true,
    };
    
    const buffs = this.guildBuffs.get(guildId) || [];
    buffs.push(buff);
    this.guildBuffs.set(guildId, buffs);
  }
  
  public getGuildBuffs(guildId: string): GuildBuff[] {
    const buffs = this.guildBuffs.get(guildId) || [];
    return buffs.filter(b => b.expiresAt > Date.now());
  }
  
  // ============ GUILD RANKING ============
  
  public updateRankings() {
    const guilds = new Map<string, { points: number; stats: any }>();
    
    // Collect all guild data
    this.warStats.forEach(stats => {
      const points = 
        stats.warsWon * 100 +
        stats.territoriesConquered * 500 -
        stats.warsLost * 20;
      
      guilds.set(stats.guildId, { points, stats });
    });
    
    // Sort and assign ranks
    const sorted = Array.from(guilds.entries())
      .sort((a, b) => b[1].points - a[1].points);
    
    sorted.forEach(([guildId, data], index) => {
      const prevRanking = this.rankings.get(guildId);
      
      const ranking: GuildRanking = {
        guildId,
        guildName: `Guild ${guildId.substr(0, 8)}`, // TODO: Get real guild name
        rank: index + 1,
        previousRank: prevRanking?.rank || index + 1,
        points: data.points,
        territoriesOwned: this.getGuildTerritories(guildId).length,
        warsWon: data.stats.warsWon,
        warsLost: data.stats.warsLost,
        totalMembers: 0, // TODO: Get from guild system
        activeMembers: 0,
        averagePower: 0,
        winRate: data.stats.totalWars > 0 ? (data.stats.warsWon / data.stats.totalWars) * 100 : 0,
        season: 'Season 1',
      };
      
      this.rankings.set(guildId, ranking);
    });
  }
  
  public getRankings(limit: number = 100): GuildRanking[] {
    return Array.from(this.rankings.values())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  }
  
  public getGuildRanking(guildId: string): GuildRanking | null {
    return this.rankings.get(guildId) || null;
  }
  
  // ============ GUILD TREASURY ============
  
  public initializeTreasury(guildId: string): GuildTreasury {
    const treasury: GuildTreasury = {
      guildId,
      gold: 0,
      gems: 0,
      guildPoints: 0,
      resources: new Map(),
      totalDonations: 0,
      weeklyDonations: new Map(),
      topDonors: [],
      weeklySpending: {
        buffs: 0,
        shop: 0,
        wars: 0,
        upgrades: 0,
      },
    };
    
    this.guildTreasuries.set(guildId, treasury);
    return treasury;
  }
  
  public getTreasury(guildId: string): GuildTreasury | null {
    return this.guildTreasuries.get(guildId) || null;
  }
  
  public donate(
    guildId: string,
    playerId: string,
    playerName: string,
    amount: number,
    type: 'gold' | 'gems'
  ): { success: boolean; error?: string } {
    let treasury = this.guildTreasuries.get(guildId);
    if (!treasury) {
      treasury = this.initializeTreasury(guildId);
    }
    
    if (type === 'gold') {
      treasury.gold += amount;
    } else {
      treasury.gems += amount;
    }
    
    treasury.totalDonations += amount;
    treasury.weeklyDonations.set(playerId, (treasury.weeklyDonations.get(playerId) || 0) + amount);
    
    return { success: true };
  }
  
  // ============ BACKGROUND PROCESSES ============
  
  private startBackgroundProcesses() {
    // Check for wars to start
    setInterval(() => {
      this.warDeclarations.forEach(war => {
        if (war.status === 'scheduled' && Date.now() >= war.scheduledTime) {
          this.startWar(war.id);
        }
        
        if (war.status === 'active' && war.endTime && Date.now() >= war.endTime) {
          this.endWar(war.id);
        }
      });
    }, 60000); // Check every minute
    
    // Update rankings
    setInterval(() => {
      this.updateRankings();
    }, GUILD_WARS_CONFIG.RANK_UPDATE_INTERVAL_HOURS * 60 * 60 * 1000);
    
    // Expire alliances
    setInterval(() => {
      this.alliances.forEach(alliance => {
        if (alliance.status === 'active' && Date.now() >= alliance.expiresAt) {
          alliance.status = 'expired';
        }
      });
    }, 3600000); // Check every hour
    
    // Clean up expired buffs
    setInterval(() => {
      this.guildBuffs.forEach((buffs, guildId) => {
        const activeBuffs = buffs.filter(b => b.expiresAt > Date.now());
        this.guildBuffs.set(guildId, activeBuffs);
      });
    }, 300000); // Check every 5 minutes
  }
  
  // ============ UTILITY ============
  
  public getActiveWars(): GuildWarDeclaration[] {
    return Array.from(this.warDeclarations.values()).filter(
      w => w.status === 'active' || w.status === 'preparation'
    );
  }
  
  public getGuildWars(guildId: string): GuildWarDeclaration[] {
    return Array.from(this.warDeclarations.values()).filter(
      w => w.attackerGuildId === guildId || w.defenderGuildId === guildId
    );
  }
  
  public getWarStats(guildId: string): GuildWarStats | null {
    return this.warStats.get(guildId) || null;
  }
}

export function getGuildWarsSystem(): GuildWarsSystem {
  return GuildWarsSystem.getGuildWarsSystem();
}
