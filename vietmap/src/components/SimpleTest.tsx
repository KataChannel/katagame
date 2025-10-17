'use client';

export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">🎮 Game Khám Phá Việt Nam</h1>
        <p className="text-xl text-gray-700 mb-6">Ứng dụng hoạt động thành công!</p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-green-600 mb-2">✅ Trạng thái hệ thống</h2>
          <ul className="text-left space-y-2">
            <li>✅ Next.js đã khởi động</li>
            <li>✅ React components hoạt động</li>
            <li>✅ Tailwind CSS được áp dụng</li>
            <li>✅ Sẵn sàng tải bản đồ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
