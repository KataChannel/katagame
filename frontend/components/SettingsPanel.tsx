import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { SaveGameManager } from '@/lib/saveGameManager';
import { useSound } from '@/lib/soundManager';
import { GraphQLApiClient } from '@/lib/graphqlApiClient';
import apolloClient from '@/lib/apolloClient';
import { Download, Upload, Trash2, Volume2, VolumeX, Music, Save, RefreshCw } from 'lucide-react';

const SettingsPanel = () => {
  const { gameSpeed, setGameSpeed } = useGameStore();
  const soundManager = useSound();
  const [saveInfo, setSaveInfo] = useState(SaveGameManager.getSaveInfo());
  const [importCode, setImportCode] = useState('');
  const [isResetting, setIsResetting] = useState(false);

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

  const handleDeleteSave = async () => {
    const confirmed = confirm(
      '⚠️ XÓA DỮ LIỆU GAME LOCAL\n\n' +
      'Hành động này sẽ:\n' +
      '• Xóa toàn bộ tiến độ game local (provinces, heroes, resources)\n' +
      '• Đăng xuất tài khoản hiện tại\n' +
      '• Xóa cache và dữ liệu đồng bộ\n\n' +
      '⚠️ LƯU Ý: Dữ liệu trên server VẪN CÒN.\n' +
      'Khi đăng nhập lại, dữ liệu sẽ được đồng bộ từ server.\n\n' +
      'Bạn có CHẮC CHẮN muốn tiếp tục?'
    );
    
    if (!confirmed) return;

    const doubleConfirm = confirm(
      '⚠️ XÁC NHẬN LẦN CUỐI\n\n' +
      'Bạn có CHẮC CHẮN muốn xóa dữ liệu game local?\n' +
      'Hành động này không thể hoàn tác!'
    );

    if (!doubleConfirm) return;

    try {
      console.log('🗑️ Bắt đầu xóa dữ liệu game local...');
      
      // 1. Delete local save data (localStorage game-storage)
      const deleteSaveResult = SaveGameManager.deleteSave();
      console.log('📦 Xóa localStorage:', deleteSaveResult ? '✅' : '❌');

      // 2. Clear Zustand store (reset to initial state)
      // Note: This will be handled by page reload
      
      // 3. Logout and clear auth token
      console.log('🔐 Đang đăng xuất...');
      await GraphQLApiClient.logout();
      
      // 4. Clear Apollo Client cache (GraphQL data)
      console.log('🗄️ Xóa GraphQL cache...');
      await apolloClient.clearStore();
      
      // 5. Clear all localStorage items related to game
      console.log('🧹 Dọn dẹp localStorage...');
      if (typeof window !== 'undefined') {
        // Remove specific keys
        const keysToRemove = [
          'katagame-store',
          'game-storage',
          'authToken',
          'auth-storage',
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`  ✅ Removed: ${key}`);
          } catch (e) {
            console.warn(`  ⚠️ Failed to remove: ${key}`, e);
          }
        });
      }

      // 6. Show success message
      alert(
        '✅ ĐÃ XÓA DỮ LIỆU LOCAL THÀNH CÔNG!\n\n' +
        '• Dữ liệu local đã được xóa\n' +
        '• Đã đăng xuất tài khoản\n' +
        '• Cache đã được làm sạch\n\n' +
        '🔄 Trang web sẽ tự động tải lại...'
      );

      // 7. Reload page to apply changes
      console.log('🔄 Reloading page...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('❌ Lỗi khi xóa dữ liệu:', error);
      alert(
        '❌ LỖI KHI XÓA DỮ LIỆU\n\n' +
        'Đã xảy ra lỗi trong quá trình xóa dữ liệu.\n' +
        'Vui lòng thử lại hoặc xóa cache/cookies thủ công trong trình duyệt.\n\n' +
        'Chi tiết lỗi: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  const handleResetServerData = async () => {
    if (isResetting) {
      alert('⏳ Đang xử lý... Vui lòng đợi!');
      return;
    }

    const confirmed = confirm(
      '🔥 XÓA DỮ LIỆU TRÊN SERVER 🔥\n\n' +
      '⚠️⚠️⚠️ CẢNH BÁO NGHIÊM TRỌNG ⚠️⚠️⚠️\n\n' +
      'Hành động này sẽ XÓA VĨNH VIỄN:\n' +
      '• TẤT CẢ tỉnh thành đã mở khóa\n' +
      '• TẤT CẢ anh hùng đã tuyển mộ\n' +
      '• TẤT CẢ tài nguyên đã thu thập\n' +
      '• Reset level về 1\n' +
      '• Reset tất cả tiến độ game\n\n' +
      '❌ KHÔNG THỂ KHÔI PHỤC!\n' +
      '❌ KHÔNG THỂ HOÀN TÁC!\n\n' +
      'Tài khoản của bạn vẫn còn nhưng TẤT CẢ TIẾN ĐỘ sẽ MẤT.\n\n' +
      'Bạn có CHẮC CHẮN muốn xóa VĨNH VIỄN dữ liệu trên server?'
    );
    
    if (!confirmed) return;

    const doubleConfirm = confirm(
      '⚠️ XÁC NHẬN LẦN 2\n\n' +
      'Bạn THỰC SỰ muốn xóa TOÀN BỘ dữ liệu game trên server?\n' +
      'Tất cả tiến độ sẽ MẤT VĨNH VIỄN!'
    );

    if (!doubleConfirm) return;

    const tripleConfirm = confirm(
      '🚨 XÁC NHẬN LẦN CUỐI 🚨\n\n' +
      'Đây là cơ hội CUỐI CÙNG để hủy bỏ!\n\n' +
      'Nhấn OK = XÓA VĨNH VIỄN dữ liệu server\n' +
      'Nhấn Cancel = Hủy bỏ và giữ nguyên dữ liệu\n\n' +
      'Bạn có CHẮC CHẮN 100%?'
    );

    if (!tripleConfirm) return;

    setIsResetting(true);

    try {
      console.log('🔥 Bắt đầu xóa dữ liệu trên server...');
      
      // 1. Call API to reset player data on server
      console.log('📡 Calling resetPlayerData mutation...');
      const result = await GraphQLApiClient.resetPlayerData();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to reset server data');
      }

      console.log('✅ Server response:', result);
      console.log('✅ Dữ liệu server đã được reset');

      // 2. Clear Apollo Client cache FIRST (to prevent refetch)
      console.log('🗄️ Xóa GraphQL cache...');
      await apolloClient.clearStore();
      
      // 3. Clear all localStorage data
      console.log('🧹 Dọn dẹp localStorage...');
      SaveGameManager.deleteSave();
      
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'katagame-store',      // Zustand persist
          'game-storage',        // Save game data
          'authToken',          // JWT token
          'auth-storage',       // Auth context
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`  ✅ Removed: ${key}`);
          } catch (e) {
            console.warn(`  ⚠️ Failed to remove: ${key}`, e);
          }
        });
      }

      // 4. Logout and clear auth token
      console.log('🔐 Đang đăng xuất...');
      await GraphQLApiClient.logout();

      // Show success message
      alert(
        '✅ ĐÃ XÓA DỮ LIỆU SERVER THÀNH CÔNG!\n\n' +
        '🔥 Tất cả tiến độ game đã bị xóa vĩnh viễn!\n\n' +
        '• Provinces: Đã xóa\n' +
        '• Heroes: Đã xóa\n' +
        '• Resources: Reset về ban đầu\n' +
        '• Level: Reset về 1\n\n' +
        '🔄 Trang web sẽ tự động tải lại...\n' +
        'Bạn có thể đăng nhập lại để bắt đầu từ đầu.'
      );

      // 5. Force reload page (hard reload to clear all cache)
      console.log('🔄 Force reloading page...');
      setTimeout(() => {
        // Force hard reload to clear all cache
        window.location.replace('/');
      }, 1500);

    } catch (error) {
      setIsResetting(false);
      console.error('❌ Lỗi khi xóa dữ liệu server:', error);
      alert(
        '❌ LỖI KHI XÓA DỮ LIỆU SERVER\n\n' +
        'Không thể xóa dữ liệu trên server.\n\n' +
        'Nguyên nhân có thể:\n' +
        '• Backend chưa triển khai mutation resetPlayerData\n' +
        '• Lỗi kết nối mạng\n' +
        '• Lỗi xác thực\n\n' +
        'Chi tiết lỗi: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
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

          {/* Delete Save - Local Only */}
          <div className="mt-4 pt-4 border-t border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="mb-3">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Xóa Dữ Liệu Local
              </h4>
              <div className="text-xs text-yellow-700 space-y-1 mb-3">
                <p>⚠️ Hành động này sẽ:</p>
                <ul className="list-disc list-inside pl-2">
                  <li>Xóa tiến độ game trên thiết bị này</li>
                  <li>Đăng xuất tài khoản</li>
                  <li>Xóa cache local</li>
                </ul>
                <p className="font-semibold text-green-800 mt-2">
                  ✅ Dữ liệu trên server VẪN CÒN
                </p>
                <p>Đăng nhập lại → khôi phục từ server.</p>
              </div>
            </div>
            
            <button
              onClick={handleDeleteSave}
              className="flex items-center justify-center gap-2 w-full bg-yellow-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-yellow-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Trash2 className="h-4 w-4" />
              Xóa Dữ Liệu Local
            </button>
          </div>

          {/* Delete Save - Server Data */}
          <div className="mt-4 pt-4 border-t-2 border-red-500 bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 shadow-lg">
            <div className="mb-3">
              <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                <Trash2 className="h-6 w-6 animate-pulse" />
                🔥 XÓA DỮ LIỆU SERVER 🔥
              </h4>
              <div className="text-xs text-red-800 space-y-1 mb-3 bg-white/50 p-3 rounded border-2 border-red-300">
                <p className="font-bold text-red-900 text-sm">⚠️⚠️⚠️ CẢNH BÁO NGHIÊM TRỌNG ⚠️⚠️⚠️</p>
                <p className="font-semibold">Hành động này sẽ XÓA VĨNH VIỄN:</p>
                <ul className="list-disc list-inside pl-2">
                  <li><strong>TẤT CẢ</strong> tỉnh thành đã mở</li>
                  <li><strong>TẤT CẢ</strong> anh hùng đã tuyển</li>
                  <li><strong>TẤT CẢ</strong> tài nguyên</li>
                  <li>Reset level về 1</li>
                  <li>Reset toàn bộ tiến độ</li>
                </ul>
                <div className="mt-2 p-2 bg-red-200 rounded border border-red-400">
                  <p className="font-bold text-red-900">❌ KHÔNG THỂ KHÔI PHỤC!</p>
                  <p className="font-bold text-red-900">❌ KHÔNG THỂ HOÀN TÁC!</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleResetServerData}
              disabled={isResetting}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-4 rounded-lg font-black hover:from-red-700 hover:to-red-900 transition-all shadow-2xl hover:shadow-red-500/50 border-2 border-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className={`h-5 w-5 ${isResetting ? 'animate-spin' : 'animate-pulse'}`} />
              {isResetting ? 'ĐANG XÓA DỮ LIỆU...' : 'XÓA VĨNH VIỄN DỮ LIỆU SERVER'}
            </button>
            <p className="text-xs text-red-900 mt-2 text-center font-bold">
              ⚠️ Yêu cầu xác nhận 3 lần!
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