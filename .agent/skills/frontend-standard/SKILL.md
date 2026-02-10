---
name: frontend-standard
description: Chuẩn mực phát triển Frontend cho KataCore - Mobile First, New York Style (Shadcn UI), Combobox Optimization & Sonner Alerts.
---

# Frontend Development Standard (KataCore Expert)

Đây là chuẩn mực phát triển giao diện cho KataCore, tập trung vào trải nghiệm người dùng (UX) hiện đại, tinh tế và tối ưu cho thiết bị di động.

## 1. Thiết kế Mobile-First
- Luôn viết CSS cho mobile trước (default classes).
- Sử dụng breakpoints (`sm:`, `md:`, `lg:`, `xl:`) để mở rộng cho màn hình lớn.
- Ví dụ: `className="w-full md:w-1/2 lg:w-1/3 p-4 md:p-6"`

## 2. Phong cách "New York" (Shadcn UI)
- **Typography**: Sử dụng font chữ sạch, giãn cách hợp lý.
- **Borders/Shadows**: Sử dụng border mỏng (`border-gray-200` hoặc `border-input`), shadow cực nhẹ hoặc không shadow để tạo vẻ sang trọng.
- **Màu sắc**: Palette tối giản (Grayscale) kết hợp với 1-2 màu Primary định danh.
- **Góc bo**: `rounded-md` hoặc `rounded-lg` (8px - 10px), tránh bo quá tròn.

## 3. Thành phần Combobox (Thay thế cho Select)
Tất cả các trường chọn dữ liệu phải sử dụng `Combobox` để hỗ trợ tìm kiếm nhanh, thay vì `Select` truyền thống.

### Quy tắc triển khai:
- Luôn hiển thị trạng thái "Không tìm thấy" (`CommandEmpty`).
- Sử dụng `Check` icon cho mục đang chọn.
- Popover width nên khớp với trigger width trên Desktop.

## 4. Thông báo & Cảnh báo (Sonner)
Sử dụng `sonner` thay thế cho `alert` hoặc `toast` mặc định khác.

### Cú pháp:
```typescript
import { toast } from "sonner";

// Thành công
toast.success("Đã hoàn thành thao tác!");

// Lỗi
toast.error("Có lỗi xảy ra!", {
  description: "Chi tiết lỗi...",
});

// Loading
toast.promise(savingPromise, {
  loading: 'Đang lưu...',
  success: 'Đã lưu!',
  error: 'Thất bại',
});
```

## 5. Thẩm mỹ & Chuyển động
- Sử dụng `animate-in`, `fade-in`, `slide-in-from-top-1` của `tailwindcss-animate`.
- Hover effects: Sử dụng `transition-all duration-200`.
- Luôn có trạng thái Loading/Skeleton chất lượng cao.


## 6. Cấu trúc Component
- Giữ component nhỏ gọn (dưới 300 dòng).
- Tách logic (Hooks) ra khỏi View nếu phức tạp.
- Sử dụng Lucide Icons đồng nhất.

## 7. Tìm kiếm mờ & Chuẩn hóa (Fuzzy Search & Normalization)
Hệ thống yêu cầu hỗ trợ tìm kiếm linh hoạt cho tiếng Việt, bao gồm bỏ dấu và tìm kiếm gần đúng.

### Nguyên tắc:
- **Chuẩn hóa (Normalization)**: Chuyển đổi "Bò Tơ" -> "bo to" để so sánh.
- **Client-Side Filtering**: Khi dữ liệu đã được load client-side (ví dụ trong Combobox), sử dụng hàm `vietnameseSearch` để lọc.

### Cú pháp:
```typescript
import { vietnameseSearch } from "@/lib/vietnamese";
import { Command } from "@/components/ui/command";

// Trong Command Component
<Command 
  filter={(value, search) => {
    if (vietnameseSearch(value, search)) return 1;
    return 0;
  }}
>
  ...
</Command>
```

### Thư viện hỗ trợ (`@/lib/vietnamese`):
Sử dụng các hàm tiện ích có sẵn:
- `removeVietnameseDiacritics(str)`: Xóa dấu tiếng Việt.
- `vietnameseSearch(text, term)`: Tìm kiếm `term` trong `text` (hỗ trợ có dấu/không dấu).

## 8. Định dạng số & Tiền tệ (Number & Currency Formatting)
Đảm bảo tính nhất quán trong việc hiển thị số lượng và số tiền.

### Nguyên tắc:
- **Số thập phân**: Với các giá trị không phải số nguyên (ví dụ: số lượng 1.5, đơn giá lẻ), luôn hiển thị tối đa **2 chữ số thập phân**.
- **Tiền tệ**: Sử dụng định dạng `vi-VN` cho tiền VND.

### Cú pháp mẫu:
```typescript
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
```
