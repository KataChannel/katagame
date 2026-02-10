'use client';
import { ComingSoon } from '@/components/UIComponents';
import { Target } from 'lucide-react';

export default function MissionsPage() {
  return (
    <ComingSoon 
      title="Nhiệm Vụ Anh Hùng" 
      description="Vượt qua các thử thách khó khăn để chứng tỏ bản thân. Các mục tiêu đang được thiết lập..."
      icon={Target}
    />
  );
}
