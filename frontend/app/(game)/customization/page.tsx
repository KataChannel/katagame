'use client';
import { ComingSoon } from '@/components/UIComponents';
import { Palette } from 'lucide-react';

export default function CustomizationPage() {
  return (
    <ComingSoon 
      title="Trang Trí Tỉnh Thành" 
      description="Cá nhân hóa diện mạo của các vùng lãnh thổ. Các nghệ nhân đang chế tác vật phẩm..."
      icon={Palette}
    />
  );
}
