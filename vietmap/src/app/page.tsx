'use client';

import dynamic from "next/dynamic";

// Dynamic import with better error handling
const VietnamMap = dynamic(
  () => import('../components/VietnamMap'), 
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl text-blue-800 font-semibold">🎮 Đang tải game bản đồ Việt Nam...</p>
          <p className="text-blue-600">Khám phá 63 tỉnh thành phố của Việt Nam!</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <VietnamMap />
    </div>
  );
}
