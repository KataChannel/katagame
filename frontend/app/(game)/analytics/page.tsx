'use client';
import { ComingSoon } from '@/components/UIComponents';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <ComingSoon 
      title="Thống Kê Giang Sơn" 
      description="Phân tích tình hình phát triển và tiềm lực của các tỉnh thành. Các sử quan đang thống kê số liệu..."
      icon={BarChart3}
    />
  );
}
