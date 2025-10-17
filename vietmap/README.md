# 🎮 Game Khám Phá Bản Đồ Việt Nam

Trò chơi tương tác giúp bạn khám phá 63 tỉnh thành phố của Việt Nam thông qua bản đồ GeoJSON.

## ✨ Tính năng

### 🎯 Game Features
- **Khám phá tỉnh thành**: Click vào các tỉnh để khám phá và thu thập điểm
- **Hệ thống điểm số**: Mỗi tỉnh được khám phá sẽ cho 10 điểm
- **Level system**: Tăng level khi đạt đủ điểm
- **Achievements**: Mở khóa thành tích khi hoàn thành mục tiêu
- **Progress tracking**: Theo dõi tiến độ khám phá 63/63 tỉnh

### 🗺️ Map Features
- **Interactive SVG Map**: Bản đồ SVG tương tác được tạo từ vietnam.geojson
- **Province Details**: Xem thông tin chi tiết về từng tỉnh
- **Color coding**: 
  - 🔵 Xanh dương: Chưa khám phá
  - 🟢 Xanh lá: Đã khám phá  
  - 🟡 Vàng: Đang chọn
- **Hover effects**: Hiển thị tên tỉnh khi di chuột
- **Province maps**: Xem bản đồ chi tiết của từng tỉnh

### 📊 Game Stats
- **Điểm số**: Tổng điểm đã đạt được
- **Level**: Cấp độ hiện tại (mỗi 100 điểm = 1 level)
- **Tiến độ**: Số tỉnh đã khám phá / 63 tỉnh
- **Thành tích**: Danh sách achievements đã mở khóa

## 🏆 Achievements

- **🎯 Nhà thám hiểm mới**: Khám phá tỉnh đầu tiên
- **🗺️ Khám phá cơ bản**: Khám phá 10 tỉnh
- **📍 Chuyên gia địa lý**: Khám phá 30 tỉnh  
- **🏆 Bậc thầy bản đồ**: Khám phá tất cả 63 tỉnh

## 🚀 Bắt đầu

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Mở [http://localhost:3000](http://localhost:3000) để bắt đầu chơi game.

## 🎮 Hướng dẫn chơi

1. **Khám phá tỉnh**: 
   - Di chuột qua các tỉnh để xem tên
   - Click vào tỉnh để khám phá và nhận điểm

2. **Xem chi tiết tỉnh**:
   - Click vào tỉnh để mở modal thông tin
   - Xem thông tin về thủ phủ, diện tích, dân số
   - Khám phá các điểm tham quan nổi bật

3. **Xem bản đồ tỉnh**:
   - Trong modal chi tiết, click "Xem bản đồ chi tiết"
   - Xem tọa độ và mở Google Maps

4. **Theo dõi tiến độ**:
   - Xem thống kê game ở góc phải màn hình
   - Theo dõi achievements đã mở khóa
   - Reset game để chơi lại

## 🛠️ Công nghệ sử dụng

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **D3.js** - Interactive map rendering and data visualization
- **GeoJSON** - Vietnam geographic data

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── layout.tsx          # Layout chính
│   ├── page.tsx           # Trang chủ
│   └── globals.css        # CSS global
├── components/
│   ├── VietnamMap.tsx     # Component bản đồ chính
│   ├── ProvinceDetail.tsx # Modal chi tiết tỉnh
│   └── D3Map.tsx          # Component D3.js map rendering
public/
├── vietnam.geojson        # Dữ liệu bản đồ Việt Nam
└── other assets...
```

## 📊 Dữ liệu

Game sử dụng file `vietnam.geojson` chứa:
- Polygon coordinates của 63 tỉnh thành
- Thông tin tên tỉnh
- Metadata về các đảo và vùng biển

## 🎯 Roadmap

- [ ] **Enhanced D3.js features**: Thêm tính năng zoom, pan và animations
- [ ] **Province detail maps**: Bản đồ chi tiết từng tỉnh với quận/huyện
- [ ] **Tourism data**: Thêm thông tin điểm du lịch thực tế
- [ ] **Quiz mode**: Chế độ câu hỏi về địa lý Việt Nam
- [ ] **Multiplayer**: Chơi cùng bạn bè
- [ ] **Mobile optimization**: Tối ưu cho điện thoại
- [ ] **Sound effects**: Âm thanh khi khám phá tỉnh
- [ ] **Save progress**: Lưu tiến độ game

## 📝 License

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more province data
- Improve map interactions  
- Add new game features
- Fix bugs and optimize performance

---

**🇻🇳 Khám phá và yêu thương đất nước Việt Nam! 🇻🇳**
