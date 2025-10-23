// Save/Load system for MVP 1
export class SaveGameManager {
  private static readonly SAVE_KEY = 'katagame_savefile';
  private static readonly BACKUP_KEY = 'katagame_backup';
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  
  private static autoSaveTimer: NodeJS.Timeout | null = null;

  // Auto-save functionality
  static startAutoSave(getGameState: () => any) {
    if (typeof window === 'undefined') return;
    
    this.autoSaveTimer = setInterval(() => {
      try {
        this.saveGame(getGameState());
        console.log('🔄 Auto-saved game');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.AUTO_SAVE_INTERVAL);
  }

  static stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Save game to localStorage
  static saveGame(gameState: any): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      // Create save data with metadata
      const saveData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        gameState: gameState,
        platform: 'web',
        mvpVersion: 1
      };

      // Backup current save before overwriting
      const currentSave = localStorage.getItem(this.SAVE_KEY);
      if (currentSave) {
        localStorage.setItem(this.BACKUP_KEY, currentSave);
      }

      // Save new data
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Save game failed:', error);
      return false;
    }
  }

  // Load game from localStorage
  static loadGame(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      if (!saveData) return null;

      const parsed = JSON.parse(saveData);
      
      // Version compatibility check
      if (!this.isCompatibleVersion(parsed.version)) {
        console.warn('Save file version incompatible:', parsed.version);
        return null;
      }

      return parsed.gameState;
    } catch (error) {
      console.error('Load game failed:', error);
      
      // Try to load backup
      try {
        const backupData = localStorage.getItem(this.BACKUP_KEY);
        if (backupData) {
          const parsed = JSON.parse(backupData);
          console.log('Loaded from backup');
          return parsed.gameState;
        }
      } catch (backupError) {
        console.error('Backup load failed:', backupError);
      }
      
      return null;
    }
  }

  // Export save data for cloud sync preparation
  static exportSave(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      if (!saveData) return null;
      
      // Encode for safe transfer
      return btoa(saveData);
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }

  // Import save data
  static importSave(encodedData: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      // Decode and validate
      const saveData = atob(encodedData);
      const parsed = JSON.parse(saveData);
      
      if (!this.isValidSaveData(parsed)) {
        throw new Error('Invalid save data format');
      }

      // Backup current save
      const currentSave = localStorage.getItem(this.SAVE_KEY);
      if (currentSave) {
        localStorage.setItem(this.BACKUP_KEY, currentSave);
      }

      // Import new save
      localStorage.setItem(this.SAVE_KEY, saveData);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Get save file info
  static getSaveInfo(): { 
    exists: boolean; 
    timestamp?: string; 
    version?: string; 
    playerLevel?: number;
    provincesUnlocked?: number;
  } {
    if (typeof window === 'undefined') return { exists: false };
    
    try {
      const saveData = localStorage.getItem(this.SAVE_KEY);
      if (!saveData) return { exists: false };

      const parsed = JSON.parse(saveData);
      return {
        exists: true,
        timestamp: parsed.timestamp,
        version: parsed.version,
        playerLevel: parsed.gameState?.player?.level,
        provincesUnlocked: parsed.gameState?.player?.unlockedProvinces?.length
      };
    } catch (error) {
      return { exists: false };
    }
  }

  // Delete save data
  static deleteSave(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(this.SAVE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      return true;
    } catch (error) {
      console.error('Delete save failed:', error);
      return false;
    }
  }

  // Check version compatibility
  private static isCompatibleVersion(version: string): boolean {
    const major = parseInt(version.split('.')[0]);
    return major === 1; // MVP 1 versions
  }

  // Validate save data structure
  private static isValidSaveData(data: any): boolean {
    return (
      data &&
      data.version &&
      data.timestamp &&
      data.gameState &&
      data.gameState.player &&
      data.gameState.provinces
    );
  }

  // Cloud save preparation (for future MVP)
  static async uploadToCloud(gameState: any): Promise<boolean> {
    // Placeholder for future cloud save implementation
    console.log('📤 Cloud save feature coming in MVP 2');
    return false;
  }

  static async downloadFromCloud(): Promise<any | null> {
    // Placeholder for future cloud save implementation
    console.log('📥 Cloud save feature coming in MVP 2');
    return null;
  }
}