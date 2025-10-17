export interface Province {
  name: string;
  capital: string;
  area: string;
  population: string;
  description: string;
  attractions: string[];
  coordinates: [number, number]; // [lat, lng] for map center
  zoom: number;
  region: 'Bắc' | 'Trung' | 'Nam';
  establishedYear?: string;
}

export const provinceData: { [key: string]: Province } = {
  // MIỀN BẮC
  'Hà Nội': {
    name: 'Hà Nội',
    capital: 'Hà Nội',
    area: '3,344.7 km²',
    population: '8.053.663 người',
    description: 'Thủ đô của Việt Nam, trung tâm chính trị, văn hóa và giáo dục của cả nước với hơn 1000 năm lịch sử.',
    attractions: ['Hồ Hoàn Kiếm', 'Văn Miếu', 'Lăng Bác', 'Phố cổ Hà Nội', 'Chùa Một Cột', 'Hoàng thành Thăng Long'],
    coordinates: [21.0285, 105.8542],
    zoom: 11,
    region: 'Bắc',
    establishedYear: '1010'
  },
  'Hải Phòng': {
    name: 'Hải Phòng',
    capital: 'Hải Phòng',
    area: '1,526.2 km²',
    population: '2.103.500 người',
    description: 'Thành phố cảng lớn nhất phía Bắc, cửa ngõ ra biển của vùng đồng bằng sông Hồng.',
    attractions: ['Cảng Hải Phòng', 'Đền Đức Ông Trần Quốc Nghiễn', 'Đảo Cát Bà', 'Bến Ninh Kiều', 'Bảo tàng Hải Phòng'],
    coordinates: [20.8449, 106.6881],
    zoom: 10,
    region: 'Bắc',
    establishedYear: '1888'
  },
  'Hạ Long': {
    name: 'Quảng Ninh',
    capital: 'Hạ Long',
    area: '6,102.8 km²',
    population: '1.320.324 người',
    description: 'Tỉnh có vịnh Hạ Long - Di sản thiên nhiên thế giới, nổi tiếng với ngành du lịch và khai thác than.',
    attractions: ['Vịnh Hạ Long', 'Đảo Tuần Châu', 'Động Thiên Cung', 'Núi Bài Thơ', 'Cảng Cái Lân'],
    coordinates: [20.9101, 107.1839],
    zoom: 9,
    region: 'Bắc',
    establishedYear: '1963'
  },
  'Hà Giang': {
    name: 'Hà Giang',
    capital: 'Hà Giang',
    area: '7,914.9 km²',
    population: '854.679 người',
    description: 'Tỉnh cực Bắc của Việt Nam, nổi tiếng với cao nguyên đá Đồng Văn và các dân tộc thiểu số.',
    attractions: ['Cao nguyên đá Đồng Văn', 'Cột cờ Lũng Cú', 'Đèo Mã Pì Lèng', 'Phố cổ Đồng Văn', 'Hoa tam giác mạch'],
    coordinates: [22.8025, 104.9784],
    zoom: 9,
    region: 'Bắc',
    establishedYear: '1962'
  },
  'Cao Bằng': {
    name: 'Cao Bằng',
    capital: 'Cao Bằng',
    area: '6,707.9 km²',
    population: '525.723 người',
    description: 'Tỉnh miền núi biên giới phía Bắc, nổi tiếng với thác Bản Giốc và hang Pác Bó.',
    attractions: ['Thác Bản Giốc', 'Hang Pác Bó', 'Hồ Thang Hen', 'Động Ngườm Ngao', 'Núi Phia Oắc'],
    coordinates: [22.6756, 106.2572],
    zoom: 9,
    region: 'Bắc',
    establishedYear: '1962'
  },
  'Lạng Sơn': {
    name: 'Lạng Sơn',
    capital: 'Lạng Sơn',
    area: '8,320.8 km²',
    population: '761.053 người',
    description: 'Tỉnh biên giới với Trung Quốc, có cửa khẩu quốc tế Đồng Đăng và nhiều di tích lịch sử.',
    attractions: ['Cửa khẩu Đồng Đăng', 'Động Tam Thanh', 'Hang Kỳ Cùng', 'Thành Mạc Đĩnh Chi', 'Bình Gia đình'],
    coordinates: [21.8533, 106.7614],
    zoom: 9,
    region: 'Bắc',
    establishedYear: '1963'
  },
  'Bắc Kạn': {
    name: 'Bắc Kạn',
    capital: 'Bắc Kạn',
    area: '4,859.4 km²',
    population: '308.900 người',
    description: 'Tỉnh miền núi phía Bắc với cảnh quan thiên nhiên hùng vĩ và văn hóa đa dân tộc.',
    attractions: ['Hồ Ba Bể', 'Động Puông', 'Thác Đắk Đrông', 'Đền Đức Ông', 'Rừng nguyên sinh'],
    coordinates: [22.1475, 105.8348],
    zoom: 9,
    region: 'Bắc'
  },
  'Thái Nguyên': {
    name: 'Thái Nguyên',
    capital: 'Thái Nguyên',
    area: '3,526.6 km²',
    population: '1.286.751 người',
    description: 'Trung tâm công nghiệp và giáo dục của vùng Trung du và miền núi phía Bắc.',
    attractions: ['Đại học Thái Nguyên', 'Hồ Núi Cốc', 'Đền Đức Ông', 'Bảo tàng Văn hóa các dân tộc', 'Khu di tích ATK'],
    coordinates: [21.5928, 105.8487],
    zoom: 10,
    region: 'Bắc'
  },
  'Tuyên Quang': {
    name: 'Tuyên Quang',
    capital: 'Tuyên Quang',
    area: '5,867.9 km²',
    population: '783.811 người',
    description: 'Tỉnh miền núi với nhiều di tích cách mạng và cảnh quan thiên nhiên đẹp.',
    attractions: ['Khu di tích Tân Trào', 'Hồ Na Hang', 'Động Hương Tích', 'Thác Mỏ Gạo', 'Rừng nguyên sinh Nà Hang'],
    coordinates: [21.8233, 105.2181],
    zoom: 9,
    region: 'Bắc'
  },
  'Phú Thọ': {
    name: 'Phú Thọ',
    capital: 'Việt Trì',
    area: '3,533.4 km²',
    population: '1.402.504 người',
    description: 'Đất tổ của dân tộc Việt Nam với Đền Hùng và nhiều di tích lịch sử văn hóa.',
    attractions: ['Đền Hùng', 'Khu di tích Đền Đức Ông', 'Hồ Đại Lải', 'Đền Âu Cơ', 'Làng nghề truyền thống'],
    coordinates: [21.4012, 105.2299],
    zoom: 10,
    region: 'Bắc'
  },

  // MIỀN TRUNG
  'Đà Nẵng': {
    name: 'Đà Nẵng',
    capital: 'Đà Nẵng',
    area: '1,285.4 km²',
    population: '1.134.310 người',
    description: 'Thành phố trung ương trực thuộc trung ương, cửa ngõ của miền Trung với nhiều bãi biển đẹp.',
    attractions: ['Cầu Vàng', 'Bà Nà Hills', 'Bãi biển Mỹ Khê', 'Chùa Linh Ứng', 'Núi Thần Tài', 'Bán đảo Sơn Trà'],
    coordinates: [16.0544, 108.2022],
    zoom: 11,
    region: 'Trung',
    establishedYear: '1997'
  },
  'Huế': {
    name: 'Thừa Thiên Huế',
    capital: 'Huế',
    area: '5,033.2 km²',
    population: '1.157.781 người',
    description: 'Cố đô của Việt Nam với Di sản văn hóa thế giới Quần thể di tích Cố đô Huế.',
    attractions: ['Đại Nội', 'Lăng Khải Định', 'Chùa Thiên Mụ', 'Sông Hương', 'Lăng Minh Mạng', 'Đền Voi Re'],
    coordinates: [16.4637, 107.5909],
    zoom: 10,
    region: 'Trung'
  },
  'Quảng Nam': {
    name: 'Quảng Nam',
    capital: 'Tam Kỳ',
    area: '10,438.4 km²',
    population: '1.495.876 người',
    description: 'Tỉnh có phố cổ Hội An - Di sản văn hóa thế giới và thánh địa Mỹ Sơn.',
    attractions: ['Phố cổ Hội An', 'Thánh địa Mỹ Sơn', 'Rừng dừa Bảy Mẫu', 'Cù Lao Chàm', 'Làng gốm Thanh Hà'],
    coordinates: [15.5394, 108.0191],
    zoom: 9,
    region: 'Trung'
  },
  'Quảng Ngãi': {
    name: 'Quảng Ngãi',
    capital: 'Quảng Ngãi',
    area: '5,153.0 km²',
    population: '1.230.693 người',
    description: 'Tỉnh ven biển miền Trung với đảo Lý Sơn và nhiều bãi biển đẹp.',
    attractions: ['Đảo Lý Sơn', 'Bãi biển Sa Huỳnh', 'Khu di tích Sơn Mỹ', 'Núi Thành', 'Chùa Thiện Ân'],
    coordinates: [15.1214, 108.8044],
    zoom: 9,
    region: 'Trung'
  },
  'Bình Định': {
    name: 'Bình Định',
    capital: 'Quy Nhon',
    area: '6,050.6 km²',
    population: '1.501.430 người',
    description: 'Tỉnh ven biển với di tích Chăm cổ và danh thắng Kỳ Co.',
    attractions: ['Kỳ Co', 'Eo Gió', 'Tháp Đôi', 'Bãi Xép', 'Hoàng Hậu Beach', 'Ghềnh Ráng'],
    coordinates: [13.7757, 109.2219],
    zoom: 9,
    region: 'Trung'
  },
  'Phú Yên': {
    name: 'Phú Yên',
    capital: 'Tuy Hòa',
    area: '5,045.3 km²',
    population: '877.200 người',
    description: 'Tỉnh ven biển nổi tiếng với Gành Đá Đĩa và các bãi biển hoang sơ.',
    attractions: ['Gành Đá Đĩa', 'Mũi Điện', 'Bãi Môn', 'Đài Radar Mũi Điện', 'Hòn Nưa'],
    coordinates: [13.0881, 109.0929],
    zoom: 9,
    region: 'Trung'
  },
  'Khánh Hòa': {
    name: 'Khánh Hòa',
    capital: 'Nha Trang',
    area: '5,217.7 km²',
    population: '1.230.500 người',
    description: 'Tỉnh du lịch biển nổi tiếng với Nha Trang và nhiều resort cao cấp.',
    attractions: ['Bãi biển Nha Trang', 'Vinpearl Land', 'Tháp Bà Ponagar', 'Hòn Tằm', 'Đảo Khỉ', 'Yang Bay'],
    coordinates: [12.2585, 109.0526],
    zoom: 9,
    region: 'Trung'
  },
  'Ninh Thuận': {
    name: 'Ninh Thuận',
    capital: 'Phan Rang - Tháp Chàm',
    area: '3,360.1 km²',
    population: '590.000 người',
    description: 'Tỉnh có văn hóa Chăm đặc sắc và cảnh quan sa mạc độc đáo.',
    attractions: ['Tháp Chăm Po Klong Garai', 'Đồi cát Nam Cương', 'Vườn nho Thái An', 'Bãi Cả', 'Rừng ngập mặn Hòn Khói'],
    coordinates: [11.6738, 108.8629],
    zoom: 9,
    region: 'Trung'
  },
  'Bình Thuận': {
    name: 'Bình Thuận',
    capital: 'Phan Thiết',
    area: '7,812.8 km²',
    population: '1.230.808 người',
    description: 'Tỉnh ven biển nổi tiếng với đồi cát bay Mũi Né và nghề làm nước mắm.',
    attractions: ['Đồi cát bay Mũi Né', 'Fairy Stream', 'Hòn Rơm', 'Làng chài Mũi Né', 'Tháp Chăm Posanu'],
    coordinates: [10.9265, 108.1074],
    zoom: 9,
    region: 'Trung'
  },

  // TÂY NGUYÊN
  'Kon Tum': {
    name: 'Kon Tum',
    capital: 'Kon Tum',
    area: '9,689.6 km²',
    population: '532.000 người',
    description: 'Tỉnh miền núi Tây Nguyên, nổi tiếng với văn hóa các dân tộc thiểu số và nhà thờ gỗ.',
    attractions: ['Nhà thờ gỗ Kon Tum', 'Làng Plei Phun', 'Làng Dak To', 'Cầu Kon Klor', 'Rừng Ngọc Linh'],
    coordinates: [14.3497, 108.0001],
    zoom: 9,
    region: 'Trung'
  },
  'Gia Lai': {
    name: 'Gia Lai',
    capital: 'Pleiku',
    area: '15,536.9 km²',
    population: '1.513.847 người',
    description: 'Tỉnh cao nguyên với cảnh quan núi rừng hùng vĩ và văn hóa đặc sắc.',
    attractions: ['Biển Hồ T\'Nưng', 'Núi Chư Đăng Ya', 'Khu du lịch Ayun Ha', 'Làng Jrai', 'Thác Xung Khoeng'],
    coordinates: [13.9829, 108.0065],
    zoom: 9,
    region: 'Trung'
  },
  'Đắk Lắk': {
    name: 'Đắk Lắk',
    capital: 'Buôn Ma Thuột',
    area: '13,125.4 km²',
    population: '1.832.708 người',
    description: 'Thủ phủ cà phê Việt Nam với những vườn cà phê bát ngát và văn hóa Êđê.',
    attractions: ['Hồ Lắk', 'Thác Dray Nur', 'Vườn Quốc gia Yok Đôn', 'Làng Êđê', 'Bảo tàng Đắk Lắk'],
    coordinates: [12.6667, 108.0377],
    zoom: 9,
    region: 'Trung'
  },
  'Đắk Nông': {
    name: 'Đắk Nông',
    capital: 'Gia Nghĩa',
    area: '6,515.6 km²',
    population: '643.000 người',
    description: 'Tỉnh cao nguyên với công viên địa chất Đắk Nông được UNESCO công nhận.',
    attractions: ['Công viên địa chất Đắk Nông', 'Thác Đray Tunu', 'Hồ Đăk Ke', 'Núi lửa Chu B\'Luk', 'Thác Trinh Nữ'],
    coordinates: [12.2646, 107.6097],
    zoom: 9,
    region: 'Trung'
  },
  'Lâm Đồng': {
    name: 'Lâm Đồng',
    capital: 'Đà Lạt',
    area: '9,773.5 km²',
    population: '1.296.906 người',
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm và nhiều danh thắng.',
    attractions: ['Hồ Xuân Hương', 'Thác Pongour', 'Valley of Love', 'Crazy House', 'Chùa Linh Phước', 'Ga Đà Lạt'],
    coordinates: [11.9404, 108.4583],
    zoom: 9,
    region: 'Trung'
  },

  // MIỀN NAM
  'TP. Hồ Chí Minh': {
    name: 'TP. Hồ Chí Minh',
    capital: 'TP. Hồ Chí Minh',
    area: '2,095.6 km²',
    population: '9.077.158 người',
    description: 'Thành phố lớn nhất Việt Nam, trung tâm kinh tế và thương mại của cả nước.',
    attractions: ['Dinh Độc Lập', 'Chợ Bến Thành', 'Nhà thờ Đức Bà', 'Bưu điện Thành phố', 'Địa đạo Củ Chi', 'Phố đi bộ Nguyễn Huệ'],
    coordinates: [10.8231, 106.6297],
    zoom: 11,
    region: 'Nam',
    establishedYear: '1976'
  },
  'Long An': {
    name: 'Long An',
    capital: 'Tân An',
    area: '4,495.4 km²',
    population: '1.688.442 người',
    description: 'Tỉnh giáp biên giới Campuchia với nhiều di tích lịch sử và cảnh quan sông nước.',
    attractions: ['Đền Bà Chúa Xứ Núi Sam', 'Rừng tràm Trà Sư', 'Khu du lịch Vàm Sát', 'Chợ nổi Cái Răng'],
    coordinates: [10.6956, 106.4230],
    zoom: 9,
    region: 'Nam'
  },
  'Đồng Tháp': {
    name: 'Đồng Tháp',
    capital: 'Cao Lãnh',
    area: '3,377.0 km²',
    population: '1.676.218 người',
    description: 'Tỉnh đồng bằng sông Cửu Long nổi tiếng với sen hồng và các làng nghề truyền thống.',
    attractions: ['Vườn quốc gia Tràm Chim', 'Rừng tràm Trà Sư', 'Đồng sen Tháp Mười', 'Làng hoa Sa Đéc', 'Xứ sở hoa sen'],
    coordinates: [10.4493, 105.6373],
    zoom: 9,
    region: 'Nam'
  },
  'An Giang': {
    name: 'An Giang',
    capital: 'Long Xuyên',
    area: '3,536.7 km²',
    population: '2.153.700 người',
    description: 'Tỉnh biên giới với Campuchia, có núi Sam và nhiều di tích văn hóa Khmer.',
    attractions: ['Núi Sam', 'Đền Bà Chúa Xứ', 'Chùa Tây An', 'Rừng tràm Trà Sú', 'Làng nổi Chau Doc'],
    coordinates: [10.3889, 105.1258],
    zoom: 9,
    region: 'Nam'
  },
  'Kiên Giang': {
    name: 'Kiên Giang',
    capital: 'Rạch Giá',
    area: '6,346.0 km²',
    population: '1.726.500 người',
    description: 'Tỉnh có đảo ngọc Phú Quốc và nhiều hòn đảo đẹp trong vịnh Thái Lan.',
    attractions: ['Đảo Phú Quốc', 'Hòn Sơn', 'Hà Tiên', 'Mũi Cà Mau', 'Rạch Giá', 'Núi Cậu'],
    coordinates: [10.0124, 105.0784],
    zoom: 9,
    region: 'Nam'
  },
  'Cần Thơ': {
    name: 'Cần Thơ',
    capital: 'Cần Thơ',
    area: '1,409 km²',
    population: '1.235.171 người',
    description: 'Thành phố trung ương trực thuộc trung ương, trung tâm của vùng đồng bằng sông Cửu Long.',
    attractions: ['Chợ nổi Cái Răng', 'Cầu Cần Thơ', 'Vườn cò Bằng Lăng', 'Làng du lịch Mỹ Khánh', 'Chùa Ông'],
    coordinates: [10.0452, 105.7469],
    zoom: 10,
    region: 'Nam',
    establishedYear: '2004'
  },
  'Vĩnh Long': {
    name: 'Vĩnh Long',
    capital: 'Vĩnh Long',
    area: '1,525.1 km²',
    population: '1.023.400 người',
    description: 'Tỉnh sông nước với nhiều vườn trái cây và chợ nổi đặc trưng miền Tây.',
    attractions: ['Cù lao An Bình', 'Vườn trái cây Cái Bè', 'Chợ nổi Cái Bè', 'Đảo Bình Hòa Phước', 'Làng nghề bánh tráng'],
    coordinates: [10.2397, 105.9571],
    zoom: 10,
    region: 'Nam'
  },
  'Đồng Nai': {
    name: 'Đồng Nai',
    capital: 'Biên Hòa',
    area: '5,907.2 km²',
    population: '3.097.107 người',
    description: 'Tỉnh công nghiệp lớn với nhiều khu công nghiệp và danh thắng tự nhiên.',
    attractions: ['Vườn Quốc gia Cát Tiên', 'Hồ Trị An', 'Khu du lịch Giang Điền', 'Làng gốm Lái Thiêu', 'Đền Bà Đen'],
    coordinates: [10.9471, 106.8177],
    zoom: 9,
    region: 'Nam'
  },
  'Bà Rịa - Vũng Tàu': {
    name: 'Bà Rịa - Vũng Tàu',
    capital: 'Vũng Tàu',
    area: '1,989.5 km²',
    population: '1.148.313 người',
    description: 'Tỉnh ven biển với bãi biển Vũng Tàu và các khu du lịch nghỉ dưỡng.',
    attractions: ['Bãi Trước', 'Bãi Sau', 'Tượng Chúa Kitô', 'Ngọn Hải Đăng', 'Hòn Bà', 'Bình Châu - Phước Bửu'],
    coordinates: [10.4113, 107.1362],
    zoom: 9,
    region: 'Nam'
  },
  'Tây Ninh': {
    name: 'Tây Ninh',
    capital: 'Tây Ninh',
    area: '4,039.7 km²',
    population: '1.089.800 người',
    description: 'Tỉnh biên giới có núi Bà Đen và Tòa thánh Cao Đài tại núi Bà Đen.',
    attractions: ['Núi Bà Đen', 'Tòa thánh Cao Đài', 'Địa đạo Củ Chi', 'Khu di tích Căn cứ Dương Minh Châu', 'Đền Bà Đen'],
    coordinates: [11.3351, 106.1107],
    zoom: 9,
    region: 'Nam'
  },
  'Bình Dương': {
    name: 'Bình Dương',
    capital: 'Thủ Dầu Một',
    area: '2,694.6 km²',
    population: '2.426.561 người',
    description: 'Tỉnh công nghiệp phát triển với nhiều khu công nghiệp và dân số đông.',
    attractions: ['Đại Nam Văn Hiến', 'Khu du lịch Suối Mơ', 'Chùa Bà Đen', 'Khu di tích Lăng Ông Nam Hải', 'Làng cổ Phước Lộc Thọ'],
    coordinates: [11.1609, 106.6630],
    zoom: 9,
    region: 'Nam'
  },
  'Bình Phước': {
    name: 'Bình Phước',
    capital: 'Đồng Xoài',
    area: '6,871.5 km²',
    population: '981.500 người',
    description: 'Tỉnh có nhiều rừng cao su và điều, với cảnh quan núi rừng tươi đẹp.',
    attractions: ['Hồ Phước Hòa', 'Vườn Quốc gia Búp Phá', 'Khu du lịch Núi Bà Ra', 'Đập Phước Hòa', 'Rừng cao su Dầu Tiếng'],
    coordinates: [11.7512, 106.7234],
    zoom: 9,
    region: 'Nam'
  },
  'Tiền Giang': {
    name: 'Tiền Giang',
    capital: 'Mỹ Tho',
    area: '2,484.3 km²',
    population: '1.738.000 người',
    description: 'Tỉnh đồng bằng sông Cửu Long với những vườn trái cây và sông nước thơ mộng.',
    attractions: ['Chợ nổi Cái Bè', 'Cù lao Thới Sơn', 'Vườn trái cây Mỹ Tho', 'Đền Trần Hưng Đạo', 'Làng nghề kẹo dừa'],
    coordinates: [10.3587, 106.3481],
    zoom: 9,
    region: 'Nam'
  },
  'Bến Tre': {
    name: 'Bến Tre',
    capital: 'Bến Tre',
    area: '2,360.2 km²',
    population: '1.258.500 người',
    description: 'Xứ sở dừa với những sản phẩm từ dừa đặc trưng và cảnh quan sông nước.',
    attractions: ['Cồn Phụng', 'Vườn dừa Bến Tre', 'Làng nghề bánh tráng', 'Chùa Vĩnh Tràng', 'Cù lao An Hòa'],
    coordinates: [10.2433, 106.3759],
    zoom: 9,
    region: 'Nam'
  },
  'Trà Vinh': {
    name: 'Trà Vinh',
    capital: 'Trà Vinh',
    area: '2,295.1 km²',
    population: '1.015.300 người',
    description: 'Tỉnh có đông đồng bào Khmer sinh sống với nhiều chùa Khmer cổ kính.',
    attractions: ['Chùa Hang', 'Chùa Ang', 'Ao Bà Om', 'Bãi biển Ba Động', 'Làng cổ Dương Đông'],
    coordinates: [9.9348, 106.3432],
    zoom: 9,
    region: 'Nam'
  },
  'Sóc Trăng': {
    name: 'Sóc Trăng',
    capital: 'Sóc Trăng',
    area: '3,311.6 km²',
    population: '1.301.950 người',
    description: 'Tỉnh có văn hóa Khmer đặc sắc với lễ hội Ok Om Bok và chùa Dơi.',
    attractions: ['Chùa Dơi', 'Chùa Đất Sét', 'Khu du lịch Mỹ Xuyên', 'Bãi biển Trần Đề', 'Làng nghề bánh pía'],
    coordinates: [9.6006, 105.9800],
    zoom: 9,
    region: 'Nam'
  },
  'Bạc Liêu': {
    name: 'Bạc Liêu',
    capital: 'Bạc Liêu',
    area: '2,468.7 km²',
    population: '873.400 người',
    description: 'Tỉnh cực Nam với nhiệt điện gió và câu chuyện công tử Bạc Liêu nổi tiếng.',
    attractions: ['Nhà thờ Bạc Liêu', 'Vườn chim Bạc Liêu', 'Bãi biển Nhà Mát', 'Cánh đồng quạt gió', 'Chùa Xiêm Cán'],
    coordinates: [9.2945, 105.7215],
    zoom: 9,
    region: 'Nam'
  },
  'Cà Mau': {
    name: 'Cà Mau',
    capital: 'Cà Mau',
    area: '5,331.7 km²',
    population: '1.194.476 người',
    description: 'Tỉnh cực Nam của Việt Nam với rừng U Minh Hạ và mũi Cà Mau.',
    attractions: ['Mũi Cà Mau', 'Rừng U Minh Hạ', 'Khu du lịch Đất Mũi', 'Cột mốc cực Nam', 'Vườn chim Cà Mau'],
    coordinates: [9.1526, 105.1524],
    zoom: 9,
    region: 'Nam'
  },
  'Hậu Giang': {
    name: 'Hậu Giang',
    capital: 'Vị Thanh',
    area: '1,608.0 km²',
    population: '769.700 người',
    description: 'Tỉnh được tách từ Cần Thơ với cảnh quan sông nước đặc trưng miền Tây.',
    attractions: ['Chợ nổi Nga Nam', 'Vườn cò Châu Thành', 'Làng nghề bánh tét', 'Khu du lịch Lungtau', 'Chùa Ông'],
    coordinates: [9.7882, 105.6412],
    zoom: 10,
    region: 'Nam'
  }
};

// Hàm helper để lấy thông tin tỉnh
export const getProvinceInfo = (provinceName: string): Province | null => {
  return provinceData[provinceName] || null;
};

// Hàm lấy danh sách tỉnh theo miền  
export const getProvincesByRegion = (region: 'Bắc' | 'Trung' | 'Nam'): Province[] => {
  return Object.values(provinceData).filter(province => province.region === region);
};

// Hàm tìm kiếm tỉnh
export const searchProvinces = (searchTerm: string): Province[] => {
  const term = searchTerm.toLowerCase();
  return Object.values(provinceData).filter(province => 
    province.name.toLowerCase().includes(term) ||
    province.capital.toLowerCase().includes(term) ||
    province.description.toLowerCase().includes(term)
  );
};
