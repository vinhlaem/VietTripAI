import type { TouristArea } from "../types";

type RawArea = readonly [
  id: string,
  name: string,
  searchQuery: string,
  tags: string[],
  isPopular?: boolean,
];

interface RawTouristAreaGroup {
  provinceName: string;
  provinceAliases?: string[];
  areas: RawArea[];
}

const touristAreaGroups = [
  {
    provinceName: "Hà Nội",
    areas: [
      ["ha-noi-hoan-kiem-old-quarter", "Hồ Hoàn Kiếm & Phố cổ Hà Nội", "Hồ Hoàn Kiếm, Phố cổ Hà Nội, Vietnam", ["culture", "local-food", "photography", "night-market"], true],
      ["ha-noi-van-mieu", "Văn Miếu - Quốc Tử Giám", "Văn Miếu - Quốc Tử Giám, Hà Nội, Vietnam", ["culture", "photography", "family"]],
      ["ha-noi-ba-vi", "Vườn quốc gia Ba Vì", "Vườn quốc gia Ba Vì, Hà Nội, Vietnam", ["nature", "photography", "family"]],
      ["ha-noi-bat-trang", "Làng gốm Bát Tràng", "Làng gốm Bát Tràng, Hà Nội, Vietnam", ["culture", "family", "local-food"]],
    ],
  },
  {
    provinceName: "Huế",
    provinceAliases: ["Thừa Thiên Huế", "Thành phố Huế"],
    areas: [
      ["hue-city", "Huế City", "Huế, Vietnam", ["culture", "local-food", "coffee", "photography"], true],
      ["hue-dai-noi", "Đại Nội Huế", "Đại Nội Huế, Huế, Vietnam", ["culture", "photography", "family"]],
      ["hue-lang-khai-dinh", "Lăng Khải Định", "Lăng Khải Định, Huế, Vietnam", ["culture", "photography"]],
      ["hue-lang-co", "Biển Lăng Cô", "Biển Lăng Cô, Huế, Vietnam", ["beach", "nature", "photography"]],
    ],
  },
  {
    provinceName: "Lai Châu",
    areas: [
      ["lai-chau-o-quy-ho", "Đèo Ô Quy Hồ", "Đèo Ô Quy Hồ, Lai Châu, Vietnam", ["nature", "photography"], true],
      ["lai-chau-putaleng", "Pu Ta Leng", "Pu Ta Leng, Lai Châu, Vietnam", ["nature", "photography"]],
      ["lai-chau-sin-suoi-ho", "Bản Sin Suối Hồ", "Bản Sin Suối Hồ, Lai Châu, Vietnam", ["culture", "nature", "photography"]],
      ["lai-chau-si-thau-chai", "Bản Sì Thâu Chải", "Bản Sì Thâu Chải, Tam Đường, Lai Châu, Vietnam", ["culture", "nature", "family"]],
    ],
  },
  {
    provinceName: "Điện Biên",
    areas: [
      ["dien-bien-a1-hill", "Đồi A1", "Đồi A1, Điện Biên Phủ, Điện Biên, Vietnam", ["culture", "photography"], true],
      ["dien-bien-museum", "Bảo tàng Chiến thắng Điện Biên Phủ", "Bảo tàng Chiến thắng Điện Biên Phủ, Điện Biên, Vietnam", ["culture", "family"]],
      ["dien-bien-pa-khoang", "Hồ Pá Khoang", "Hồ Pá Khoang, Điện Biên, Vietnam", ["nature", "family", "photography"]],
      ["dien-bien-pha-din", "Đèo Pha Đin", "Đèo Pha Đin, Điện Biên, Vietnam", ["nature", "photography"]],
    ],
  },
  {
    provinceName: "Sơn La",
    areas: [
      ["son-la-moc-chau", "Mộc Châu", "Mộc Châu, Sơn La, Vietnam", ["nature", "coffee", "photography", "family"], true],
      ["son-la-ta-xua", "Tà Xùa", "Tà Xùa, Sơn La, Vietnam", ["nature", "photography"]],
      ["son-la-thac-dai-yem", "Thác Dải Yếm", "Thác Dải Yếm, Mộc Châu, Sơn La, Vietnam", ["nature", "family", "photography"]],
      ["son-la-ngoc-chien", "Ngọc Chiến", "Ngọc Chiến, Sơn La, Vietnam", ["nature", "culture", "family"]],
    ],
  },
  {
    provinceName: "Lạng Sơn",
    areas: [
      ["lang-son-mau-son", "Mẫu Sơn", "Mẫu Sơn, Lạng Sơn, Vietnam", ["nature", "photography"], true],
      ["lang-son-tam-thanh", "Động Tam Thanh", "Động Tam Thanh, Lạng Sơn, Vietnam", ["culture", "nature", "photography"]],
      ["lang-son-nhi-thanh", "Động Nhị Thanh", "Động Nhị Thanh, Lạng Sơn, Vietnam", ["culture", "nature"]],
      ["lang-son-dong-kinh-market", "Chợ Đông Kinh", "Chợ Đông Kinh, Lạng Sơn, Vietnam", ["local-food", "night-market", "family"]],
    ],
  },
  {
    provinceName: "Quảng Ninh",
    areas: [
      ["quang-ninh-ha-long-bay", "Vịnh Hạ Long", "Vịnh Hạ Long, Quảng Ninh, Vietnam", ["nature", "beach", "photography", "family"], true],
      ["quang-ninh-yen-tu", "Yên Tử", "Yên Tử, Quảng Ninh, Vietnam", ["culture", "nature", "family"]],
      ["quang-ninh-co-to", "Cô Tô", "Cô Tô, Quảng Ninh, Vietnam", ["beach", "nature", "photography"]],
      ["quang-ninh-bai-chay", "Bãi Cháy", "Bãi Cháy, Hạ Long, Quảng Ninh, Vietnam", ["beach", "night-market", "local-food", "family"]],
    ],
  },
  {
    provinceName: "Thanh Hóa",
    areas: [
      ["thanh-hoa-sam-son", "Biển Sầm Sơn", "Biển Sầm Sơn, Thanh Hóa, Vietnam", ["beach", "local-food", "family"], true],
      ["thanh-hoa-pu-luong", "Pù Luông", "Pù Luông, Thanh Hóa, Vietnam", ["nature", "culture", "photography"]],
      ["thanh-hoa-ben-en", "Vườn quốc gia Bến En", "Vườn quốc gia Bến En, Thanh Hóa, Vietnam", ["nature", "family", "photography"]],
      ["thanh-hoa-citadel", "Thành Nhà Hồ", "Thành Nhà Hồ, Thanh Hóa, Vietnam", ["culture", "photography"]],
    ],
  },
  {
    provinceName: "Nghệ An",
    areas: [
      ["nghe-an-cua-lo", "Biển Cửa Lò", "Biển Cửa Lò, Nghệ An, Vietnam", ["beach", "local-food", "family"], true],
      ["nghe-an-kim-lien", "Khu di tích Kim Liên", "Khu di tích Kim Liên, Nghệ An, Vietnam", ["culture", "family"]],
      ["nghe-an-pu-mat", "Vườn quốc gia Pù Mát", "Vườn quốc gia Pù Mát, Nghệ An, Vietnam", ["nature", "photography"]],
      ["nghe-an-thanh-chuong-tea-island", "Đảo chè Thanh Chương", "Đảo chè Thanh Chương, Nghệ An, Vietnam", ["nature", "photography", "family"]],
    ],
  },
  {
    provinceName: "Hà Tĩnh",
    areas: [
      ["ha-tinh-thien-cam", "Biển Thiên Cầm", "Biển Thiên Cầm, Hà Tĩnh, Vietnam", ["beach", "local-food", "family"], true],
      ["ha-tinh-ke-go", "Hồ Kẻ Gỗ", "Hồ Kẻ Gỗ, Hà Tĩnh, Vietnam", ["nature", "photography", "family"]],
      ["ha-tinh-huong-tich", "Chùa Hương Tích", "Chùa Hương Tích, Hà Tĩnh, Vietnam", ["culture", "nature"]],
      ["ha-tinh-nga-ba-dong-loc", "Ngã ba Đồng Lộc", "Ngã ba Đồng Lộc, Hà Tĩnh, Vietnam", ["culture", "family"]],
    ],
  },
  {
    provinceName: "Cao Bằng",
    areas: [
      ["cao-bang-ban-gioc", "Thác Bản Giốc", "Thác Bản Giốc, Cao Bằng, Vietnam", ["nature", "photography"], true],
      ["cao-bang-pac-bo", "Khu di tích Pác Bó", "Khu di tích Pác Bó, Cao Bằng, Vietnam", ["culture", "nature", "family"]],
      ["cao-bang-nguom-ngao", "Động Ngườm Ngao", "Động Ngườm Ngao, Cao Bằng, Vietnam", ["nature", "photography"]],
      ["cao-bang-non-nuoc-geopark", "Công viên địa chất Non Nước Cao Bằng", "Non Nước Cao Bằng Geopark, Cao Bằng, Vietnam", ["nature", "culture", "photography"]],
    ],
  },
  {
    provinceName: "Tuyên Quang",
    provinceAliases: ["Hà Giang"],
    areas: [
      ["ha-giang-dong-van", "Đồng Văn", "Đồng Văn, Hà Giang, Vietnam", ["nature", "culture", "photography"], true],
      ["ha-giang-ma-pi-leng", "Đèo Mã Pí Lèng", "Đèo Mã Pí Lèng, Hà Giang, Vietnam", ["nature", "photography"]],
      ["tuyen-quang-na-hang", "Na Hang", "Na Hang, Tuyên Quang, Vietnam", ["nature", "culture", "photography"]],
      ["tuyen-quang-tan-trao", "Tân Trào", "Tân Trào, Tuyên Quang, Vietnam", ["culture", "family", "nature"]],
    ],
  },
  {
    provinceName: "Lào Cai",
    provinceAliases: ["Yên Bái"],
    areas: [
      ["lao-cai-sa-pa", "Sa Pa", "Sa Pa, Lào Cai, Vietnam", ["nature", "culture", "coffee", "photography"], true],
      ["lao-cai-fansipan", "Fansipan", "Fansipan, Sa Pa, Lào Cai, Vietnam", ["nature", "photography", "family"]],
      ["yen-bai-mu-cang-chai", "Mù Cang Chải", "Mù Cang Chải, Yên Bái, Vietnam", ["nature", "culture", "photography"]],
      ["yen-bai-thac-ba", "Hồ Thác Bà", "Hồ Thác Bà, Yên Bái, Vietnam", ["nature", "family", "photography"]],
    ],
  },
  {
    provinceName: "Thái Nguyên",
    provinceAliases: ["Bắc Kạn"],
    areas: [
      ["thai-nguyen-tan-cuong-tea", "Đồi chè Tân Cương", "Đồi chè Tân Cương, Thái Nguyên, Vietnam", ["nature", "culture", "coffee", "photography"], true],
      ["thai-nguyen-nui-coc", "Hồ Núi Cốc", "Hồ Núi Cốc, Thái Nguyên, Vietnam", ["nature", "family"]],
      ["bac-kan-ba-be", "Hồ Ba Bể", "Hồ Ba Bể, Bắc Kạn, Vietnam", ["nature", "culture", "photography"]],
      ["bac-kan-pac-ngoi", "Bản Pác Ngòi", "Bản Pác Ngòi, Bắc Kạn, Vietnam", ["culture", "nature", "family"]],
    ],
  },
  {
    provinceName: "Phú Thọ",
    provinceAliases: ["Vĩnh Phúc", "Hòa Bình"],
    areas: [
      ["phu-tho-den-hung", "Đền Hùng", "Đền Hùng, Phú Thọ, Vietnam", ["culture", "family"], true],
      ["vinh-phuc-tam-dao", "Tam Đảo", "Tam Đảo, Vĩnh Phúc, Vietnam", ["nature", "coffee", "photography"]],
      ["hoa-binh-mai-chau", "Mai Châu", "Mai Châu, Hòa Bình, Vietnam", ["nature", "culture", "family", "photography"]],
      ["hoa-binh-thung-nai", "Thung Nai", "Thung Nai, Hòa Bình, Vietnam", ["nature", "family", "photography"]],
    ],
  },
  {
    provinceName: "Bắc Ninh",
    provinceAliases: ["Bắc Giang"],
    areas: [
      ["bac-ninh-but-thap", "Chùa Bút Tháp", "Chùa Bút Tháp, Bắc Ninh, Vietnam", ["culture", "photography"], true],
      ["bac-ninh-do-temple", "Đền Đô", "Đền Đô, Bắc Ninh, Vietnam", ["culture", "family"]],
      ["bac-giang-tay-yen-tu", "Tây Yên Tử", "Tây Yên Tử, Bắc Giang, Vietnam", ["culture", "nature", "family"]],
      ["bac-giang-suoi-mo", "Suối Mỡ", "Suối Mỡ, Bắc Giang, Vietnam", ["nature", "culture", "family"]],
    ],
  },
  {
    provinceName: "Hưng Yên",
    provinceAliases: ["Thái Bình"],
    areas: [
      ["hung-yen-pho-hien", "Phố Hiến", "Phố Hiến, Hưng Yên, Vietnam", ["culture", "local-food", "photography"], true],
      ["hung-yen-nom-village", "Làng Nôm", "Làng Nôm, Hưng Yên, Vietnam", ["culture", "photography", "family"]],
      ["thai-binh-con-den", "Biển Cồn Đen", "Biển Cồn Đen, Thái Bình, Vietnam", ["beach", "nature", "local-food"]],
      ["thai-binh-keo-pagoda", "Chùa Keo", "Chùa Keo, Thái Bình, Vietnam", ["culture", "family", "photography"]],
    ],
  },
  {
    provinceName: "Hải Phòng",
    provinceAliases: ["Hải Dương", "Thành phố Hải Phòng"],
    areas: [
      ["hai-phong-cat-ba", "Cát Bà", "Cát Bà, Hải Phòng, Vietnam", ["beach", "nature", "local-food", "photography"], true],
      ["hai-phong-do-son", "Đồ Sơn", "Đồ Sơn, Hải Phòng, Vietnam", ["beach", "family", "local-food"]],
      ["hai-phong-lan-ha-bay", "Vịnh Lan Hạ", "Vịnh Lan Hạ, Hải Phòng, Vietnam", ["nature", "beach", "photography"]],
      ["hai-duong-con-son-kiep-bac", "Côn Sơn - Kiếp Bạc", "Côn Sơn Kiếp Bạc, Hải Dương, Vietnam", ["culture", "nature", "family"]],
    ],
  },
  {
    provinceName: "Ninh Bình",
    provinceAliases: ["Nam Định", "Hà Nam"],
    areas: [
      ["ninh-binh-trang-an", "Tràng An", "Tràng An, Ninh Bình, Vietnam", ["nature", "culture", "photography", "family"], true],
      ["ninh-binh-tam-coc", "Tam Cốc - Bích Động", "Tam Cốc Bích Động, Ninh Bình, Vietnam", ["nature", "photography", "family"]],
      ["nam-dinh-quat-lam", "Biển Quất Lâm", "Biển Quất Lâm, Nam Định, Vietnam", ["beach", "local-food", "family"]],
      ["ha-nam-tam-chuc", "Chùa Tam Chúc", "Chùa Tam Chúc, Hà Nam, Vietnam", ["culture", "nature", "family"]],
    ],
  },
  {
    provinceName: "Quảng Trị",
    provinceAliases: ["Quảng Bình"],
    areas: [
      ["quang-binh-phong-nha", "Phong Nha - Kẻ Bàng", "Phong Nha - Kẻ Bàng, Quảng Bình, Vietnam", ["nature", "photography"], true],
      ["quang-binh-nhat-le", "Biển Nhật Lệ", "Biển Nhật Lệ, Đồng Hới, Quảng Bình, Vietnam", ["beach", "local-food", "family"]],
      ["quang-tri-vinh-moc", "Địa đạo Vịnh Mốc", "Địa đạo Vịnh Mốc, Quảng Trị, Vietnam", ["culture", "family"]],
      ["quang-tri-cua-tung", "Biển Cửa Tùng", "Biển Cửa Tùng, Quảng Trị, Vietnam", ["beach", "family", "local-food"]],
    ],
  },
  {
    provinceName: "Đà Nẵng",
    provinceAliases: ["Thành phố Đà Nẵng", "Quảng Nam"],
    areas: [
      ["da-nang-city-center", "Đà Nẵng City Center", "Hải Châu, Đà Nẵng, Vietnam", ["local-food", "culture", "night-market"], true],
      ["da-nang-my-khe", "Mỹ Khê", "Mỹ Khê Beach, Đà Nẵng, Vietnam", ["beach", "family", "photography"]],
      ["da-nang-ba-na-hills", "Bà Nà Hills", "Bà Nà Hills, Đà Nẵng, Vietnam", ["nature", "photography", "family"]],
      ["quang-nam-hoi-an", "Hội An", "Hội An, Quảng Nam, Vietnam", ["culture", "local-food", "photography", "night-market"]],
      ["quang-nam-my-son-sanctuary", "Mỹ Sơn Sanctuary", "Mỹ Sơn Sanctuary, Quảng Nam, Vietnam", ["culture", "photography"]],
    ],
  },
  {
    provinceName: "Quảng Ngãi",
    provinceAliases: ["Kon Tum"],
    areas: [
      ["quang-ngai-ly-son", "Lý Sơn", "Lý Sơn, Quảng Ngãi, Vietnam", ["beach", "nature", "local-food", "photography"], true],
      ["quang-ngai-my-khe", "Biển Mỹ Khê Quảng Ngãi", "Biển Mỹ Khê, Quảng Ngãi, Vietnam", ["beach", "local-food", "family"]],
      ["quang-ngai-ba-to", "Ba Tơ", "Ba Tơ, Quảng Ngãi, Vietnam", ["nature", "culture"]],
      ["kon-tum-mang-den", "Măng Đen", "Măng Đen, Kon Tum, Vietnam", ["nature", "coffee", "photography"]],
    ],
  },
  {
    provinceName: "Gia Lai",
    provinceAliases: ["Bình Định"],
    areas: [
      ["gia-lai-bien-ho", "Biển Hồ Pleiku", "Biển Hồ Pleiku, Gia Lai, Vietnam", ["nature", "coffee", "photography"], true],
      ["gia-lai-chu-dang-ya", "Núi lửa Chư Đăng Ya", "Núi lửa Chư Đăng Ya, Gia Lai, Vietnam", ["nature", "photography"]],
      ["binh-dinh-ky-co", "Kỳ Co", "Kỳ Co, Bình Định, Vietnam", ["beach", "photography", "family"]],
      ["binh-dinh-eo-gio", "Eo Gió", "Eo Gió, Bình Định, Vietnam", ["beach", "nature", "photography"]],
    ],
  },
  {
    provinceName: "Khánh Hòa",
    provinceAliases: ["Ninh Thuận"],
    areas: [
      ["khanh-hoa-nha-trang", "Nha Trang", "Nha Trang, Khánh Hòa, Vietnam", ["beach", "local-food", "coffee", "family"], true],
      ["khanh-hoa-binh-ba", "Bình Ba", "Bình Ba, Khánh Hòa, Vietnam", ["beach", "local-food", "photography"]],
      ["ninh-thuan-vinh-hy", "Vĩnh Hy", "Vĩnh Hy, Ninh Thuận, Vietnam", ["beach", "nature", "photography"]],
      ["ninh-thuan-ninh-chu", "Biển Ninh Chữ", "Biển Ninh Chữ, Ninh Thuận, Vietnam", ["beach", "family", "local-food"]],
    ],
  },
  {
    provinceName: "Lâm Đồng",
    provinceAliases: ["Bình Thuận", "Đắk Nông"],
    areas: [
      ["lam-dong-da-lat", "Đà Lạt", "Đà Lạt, Lâm Đồng, Vietnam", ["nature", "coffee", "photography"], true],
      ["lam-dong-ho-tuyen-lam", "Hồ Tuyền Lâm", "Hồ Tuyền Lâm, Đà Lạt, Lâm Đồng, Vietnam", ["nature", "photography", "family"]],
      ["binh-thuan-mui-ne", "Mũi Né", "Mũi Né, Bình Thuận, Vietnam", ["beach", "nature", "local-food", "photography"]],
      ["dak-nong-ta-dung", "Tà Đùng", "Tà Đùng, Đắk Nông, Vietnam", ["nature", "photography"]],
    ],
  },
  {
    provinceName: "Đắk Lắk",
    provinceAliases: ["Phú Yên"],
    areas: [
      ["dak-lak-buon-ma-thuot", "Buôn Ma Thuột", "Buôn Ma Thuột, Đắk Lắk, Vietnam", ["coffee", "culture", "local-food"], true],
      ["dak-lak-ban-don", "Buôn Đôn", "Buôn Đôn, Đắk Lắk, Vietnam", ["culture", "nature", "family"]],
      ["dak-lak-dray-nur", "Thác Dray Nur", "Thác Dray Nur, Đắk Lắk, Vietnam", ["nature", "photography"]],
      ["phu-yen-ghenh-da-dia", "Ghềnh Đá Đĩa", "Ghềnh Đá Đĩa, Phú Yên, Vietnam", ["beach", "nature", "photography"]],
    ],
  },
  {
    provinceName: "Hồ Chí Minh",
    provinceAliases: ["Thành phố Hồ Chí Minh", "TP. Hồ Chí Minh", "Sài Gòn", "Bình Dương", "Bà Rịa - Vũng Tàu", "Bà Rịa Vũng Tàu"],
    areas: [
      ["ho-chi-minh-city-center", "Sài Gòn City Center", "District 1, Ho Chi Minh City, Vietnam", ["culture", "local-food", "coffee", "night-market"], true],
      ["ho-chi-minh-cu-chi", "Địa đạo Củ Chi", "Địa đạo Củ Chi, Hồ Chí Minh, Vietnam", ["culture", "family"]],
      ["ba-ria-vung-tau-vung-tau", "Vũng Tàu", "Vũng Tàu, Bà Rịa - Vũng Tàu, Vietnam", ["beach", "local-food", "family"]],
      ["ba-ria-vung-tau-con-dao", "Côn Đảo", "Côn Đảo, Bà Rịa - Vũng Tàu, Vietnam", ["beach", "nature", "culture", "photography"]],
    ],
  },
  {
    provinceName: "Đồng Nai",
    provinceAliases: ["Bình Phước"],
    areas: [
      ["dong-nai-nam-cat-tien", "Vườn quốc gia Cát Tiên", "Vườn quốc gia Cát Tiên, Đồng Nai, Vietnam", ["nature", "family", "photography"], true],
      ["dong-nai-buu-long", "Khu du lịch Bửu Long", "Khu du lịch Bửu Long, Đồng Nai, Vietnam", ["nature", "family", "photography"]],
      ["dong-nai-tri-an", "Hồ Trị An", "Hồ Trị An, Đồng Nai, Vietnam", ["nature", "family", "photography"]],
      ["binh-phuoc-bu-gia-map", "Vườn quốc gia Bù Gia Mập", "Vườn quốc gia Bù Gia Mập, Bình Phước, Vietnam", ["nature", "photography"]],
    ],
  },
  {
    provinceName: "Tây Ninh",
    provinceAliases: ["Long An"],
    areas: [
      ["tay-ninh-ba-den", "Núi Bà Đen", "Núi Bà Đen, Tây Ninh, Vietnam", ["nature", "culture", "photography", "family"], true],
      ["tay-ninh-cao-dai-temple", "Tòa Thánh Cao Đài", "Tòa Thánh Cao Đài, Tây Ninh, Vietnam", ["culture", "photography", "family"]],
      ["long-an-tan-lap", "Làng nổi Tân Lập", "Làng nổi Tân Lập, Long An, Vietnam", ["nature", "photography", "family"]],
      ["long-an-cat-tuong-phu-sinh", "Cát Tường Phú Sinh", "Cát Tường Phú Sinh, Long An, Vietnam", ["family", "photography"]],
    ],
  },
  {
    provinceName: "Cần Thơ",
    provinceAliases: ["Hậu Giang", "Sóc Trăng", "Thành phố Cần Thơ"],
    areas: [
      ["can-tho-cai-rang", "Chợ nổi Cái Răng", "Chợ nổi Cái Răng, Cần Thơ, Vietnam", ["culture", "local-food", "photography"], true],
      ["can-tho-ninh-kieu", "Bến Ninh Kiều", "Bến Ninh Kiều, Cần Thơ, Vietnam", ["local-food", "night-market", "family"]],
      ["hau-giang-lung-ngoc-hoang", "Khu bảo tồn Lung Ngọc Hoàng", "Lung Ngọc Hoàng, Hậu Giang, Vietnam", ["nature", "photography"]],
      ["soc-trang-som-rong", "Chùa Som Rong", "Chùa Som Rong, Sóc Trăng, Vietnam", ["culture", "photography", "family"]],
    ],
  },
  {
    provinceName: "Vĩnh Long",
    provinceAliases: ["Bến Tre", "Trà Vinh"],
    areas: [
      ["ben-tre-con-phung", "Cồn Phụng", "Cồn Phụng, Bến Tre, Vietnam", ["nature", "culture", "local-food", "family"], true],
      ["vinh-long-an-binh", "Cù lao An Bình", "Cù lao An Bình, Vĩnh Long, Vietnam", ["nature", "local-food", "family"]],
      ["tra-vinh-ao-ba-om", "Ao Bà Om", "Ao Bà Om, Trà Vinh, Vietnam", ["culture", "nature", "family"]],
      ["tra-vinh-hang-pagoda", "Chùa Hang", "Chùa Hang, Trà Vinh, Vietnam", ["culture", "nature", "photography"]],
    ],
  },
  {
    provinceName: "Đồng Tháp",
    provinceAliases: ["Tiền Giang"],
    areas: [
      ["dong-thap-tram-chim", "Vườn quốc gia Tràm Chim", "Vườn quốc gia Tràm Chim, Đồng Tháp, Vietnam", ["nature", "photography", "family"], true],
      ["dong-thap-sa-dec-flower", "Làng hoa Sa Đéc", "Làng hoa Sa Đéc, Đồng Tháp, Vietnam", ["nature", "photography", "family"]],
      ["tien-giang-thoi-son", "Cù lao Thới Sơn", "Cù lao Thới Sơn, Tiền Giang, Vietnam", ["nature", "local-food", "family"]],
      ["tien-giang-vinh-trang", "Chùa Vĩnh Tràng", "Chùa Vĩnh Tràng, Tiền Giang, Vietnam", ["culture", "photography", "family"]],
    ],
  },
  {
    provinceName: "An Giang",
    provinceAliases: ["Kiên Giang"],
    areas: [
      ["an-giang-chau-doc", "Châu Đốc", "Châu Đốc, An Giang, Vietnam", ["culture", "local-food", "photography"], true],
      ["an-giang-tra-su", "Rừng tràm Trà Sư", "Rừng tràm Trà Sư, An Giang, Vietnam", ["nature", "photography", "family"]],
      ["kien-giang-phu-quoc", "Phú Quốc", "Phú Quốc, Kiên Giang, Vietnam", ["beach", "local-food", "family", "photography"]],
      ["kien-giang-ha-tien", "Hà Tiên", "Hà Tiên, Kiên Giang, Vietnam", ["beach", "culture", "local-food"]],
    ],
  },
  {
    provinceName: "Cà Mau",
    provinceAliases: ["Bạc Liêu"],
    areas: [
      ["ca-mau-dat-mui", "Đất Mũi Cà Mau", "Đất Mũi Cà Mau, Cà Mau, Vietnam", ["nature", "photography", "family"], true],
      ["ca-mau-u-minh-ha", "Vườn quốc gia U Minh Hạ", "Vườn quốc gia U Minh Hạ, Cà Mau, Vietnam", ["nature", "photography"]],
      ["bac-lieu-wind-farm", "Cánh đồng điện gió Bạc Liêu", "Cánh đồng điện gió Bạc Liêu, Bạc Liêu, Vietnam", ["photography", "nature", "family"]],
      ["bac-lieu-prince-house", "Nhà Công tử Bạc Liêu", "Nhà Công tử Bạc Liêu, Bạc Liêu, Vietnam", ["culture", "family", "photography"]],
    ],
  },
] satisfies RawTouristAreaGroup[];

export const vietnamTouristAreas: TouristArea[] = touristAreaGroups.flatMap(
  ({ provinceName, provinceAliases, areas }) =>
    areas.map(([id, name, searchQuery, tags, isPopular]) => ({
      id,
      provinceName,
      ...(provinceAliases ? { provinceAliases } : {}),
      name,
      searchQuery,
      tags,
      ...(isPopular ? { isPopular } : {}),
    })),
);
