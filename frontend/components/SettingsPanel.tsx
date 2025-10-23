import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { SaveGameManager } from '@/lib/saveGameManager';
import { useSound } from '@/lib/soundManager';
import { Download, Upload, Trash2, Volume2, VolumeX, Music, Save, RefreshCw } from 'lucide-react';

const SettingsPanel = () => {
  const { gameSpeed, setGameSpeed } = useGameStore();
  const soundManager = useSound();
  const [saveInfo, setSaveInfo] = useState(SaveGameManager.getSaveInfo());
  const [importCode, setImportCode] = useState('');

  const handleExportSave = () => {
    const exportData = SaveGameManager.exportSave();
    if (exportData) {
      navigator.clipboard.writeText(exportData);
      alert('📋 Đã copy mã save vào clipboard!\nBạn có thể lưu mã này để khôi phục game sau.');
    } else {
      alert('❌ Không thể export save file');
    }
  };

  const handleImportSave = () => {
    if (!importCode.trim()) {
      alert('⚠️ Vui lòng nhập mã save');
      return;
    }

    if (SaveGameManager.importSave(importCode.trim())) {
      alert('✅ Import thành công! Tải lại trang để áp dụng.');
      setImportCode('');
      setSaveInfo(SaveGameManager.getSaveInfo());
    } else {
      alert('❌ Mã save không hợp lệ');
    }
  };

  const handleDeleteSave = () => {
    if (confirm('⚠️ Bạn có chắc muốn xóa dữ liệu game?\nHành động này không thể hoàn tác!')) {
      if (SaveGameManager.deleteSave()) {
        alert('✅ Đã xóa dữ liệu game. Tải lại trang để bắt đầu mới.');
        setSaveInfo(SaveGameManager.getSaveInfo());
      } else {
        alert('❌ Không thể xóa dữ liệu');
      }
    }
  };

  const handleManualSave = () => {
    // In real app, would get current game state from store
    alert('💾 Đã lưu game thủ công!');
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-6">⚙️ Cài Đặt</h2>
      
      <div className="space-y-6">
        {/* Game Speed */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tốc Độ Game
          </label>
          <select
            value={gameSpeed}
            onChange={(e) => setGameSpeed(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value={0.5}>Chậm (0.5x)</option>
            <option value={1}>Bình Thường (1x)</option>
            <option value={2}>Nhanh (2x)</option>
            <option value={5}>Rất Nhanh (5x)</option>
          </select>
        </div>

        {/* Audio Settings */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Cài Đặt Âm Thanh
          </h3>
          
          <div className="space-y-4">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Hiệu Ứng Âm Thanh</span>
              <button
                onClick={() => soundManager.setSoundEnabled(!soundManager.getSoundEnabled())}
                className={`p-2 rounded-lg transition-colors ${
                  soundManager.getSoundEnabled() 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {soundManager.getSoundEnabled() ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>

            {/* Background Music */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Nhạc Nền</span>
              <button
                onClick={() => soundManager.setMusicEnabled(!soundManager.getMusicEnabled())}
                className={`p-2 rounded-lg transition-colors ${
                  soundManager.getMusicEnabled() 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Music className="h-4 w-4" />
              </button>
            </div>

            {/* Volume Slider */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Âm Lượng: {Math.round(soundManager.getVolume() * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={soundManager.getVolume()}
                onChange={(e) => soundManager.setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save System */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Save className="h-5 w-5" />
            Quản Lý Dữ Liệu Game
          </h3>

          {/* Save Info */}
          {saveInfo.exists && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-800 mb-2">Thông Tin Save:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Cấp độ: {saveInfo.playerLevel}</p>
                <p>• Tỉnh đã mở: {saveInfo.provincesUnlocked}</p>
                <p>• Lưu lần cuối: {saveInfo.timestamp ? new Date(saveInfo.timestamp).toLocaleString('vi-VN') : 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Save Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleManualSave}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              <Save className="h-4 w-4" />
              Lưu Thủ Công
            </button>

            <button
              onClick={handleExportSave}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Save
            </button>
          </div>

          {/* Import Section */}
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Import Save Code:
            </label>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Dán mã save ở đây..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none h-20 text-sm"
            />
            <button
              onClick={handleImportSave}
              disabled={!importCode.trim()}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import Save
            </button>
          </div>

          {/* Delete Save */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={handleDeleteSave}
              className="flex items-center justify-center gap-2 w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Xóa Dữ Liệu Game
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              ⚠️ Hành động này sẽ xóa toàn bộ tiến độ game
            </p>
          </div>
        </div>

        {/* Game Info */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Thông Tin Game</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Phiên bản:</strong> MVP 1: Khởi Nguồn Đất Việt v0.1.0</p>
            <p>• <strong>Nhà phát triển:</strong> Kata Game Studio</p>
            <p>• <strong>Platform:</strong> Web (Next.js 15)</p>
            <p>• <strong>Auto-save:</strong> Mỗi 30 giây</p>
          </div>
        </div>

        {/* Cloud Save Teaser */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sắp Ra Mắt
          </h4>
          <p className="text-sm text-purple-700">
            🔄 <strong>Cloud Save:</strong> Đồng bộ dữ liệu qua nhiều thiết bị (MVP 2)
          </p>
          <p className="text-sm text-purple-700">
            🌐 <strong>Cross-Platform:</strong> Chơi trên mobile app (MVP 3)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;