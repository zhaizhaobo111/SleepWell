export interface City {
  name: string;
  lat: number;
  lon: number;
}

export interface CityGroup {
  province: string;
  cities: City[];
}

// 主要城市数据（省-市二级，带经纬度）
export const CITY_DATA: CityGroup[] = [
  {
    province: "北京市",
    cities: [
      { name: "北京市", lat: 39.9042, lon: 116.4074 },
    ],
  },
  {
    province: "上海市",
    cities: [
      { name: "上海市", lat: 31.2304, lon: 121.4737 },
    ],
  },
  {
    province: "天津市",
    cities: [
      { name: "天津市", lat: 39.3434, lon: 117.3616 },
    ],
  },
  {
    province: "重庆市",
    cities: [
      { name: "重庆市", lat: 29.5630, lon: 106.5516 },
    ],
  },
  {
    province: "广东省",
    cities: [
      { name: "广州市", lat: 23.1291, lon: 113.2644 },
      { name: "深圳市", lat: 22.5431, lon: 114.0579 },
      { name: "东莞市", lat: 23.0208, lon: 113.7518 },
      { name: "佛山市", lat: 23.0218, lon: 113.1218 },
      { name: "珠海市", lat: 22.2710, lon: 113.5767 },
      { name: "中山市", lat: 22.5170, lon: 113.3925 },
      { name: "惠州市", lat: 23.1115, lon: 114.4156 },
      { name: "汕头市", lat: 23.3541, lon: 116.6820 },
      { name: "湛江市", lat: 21.2707, lon: 110.3594 },
    ],
  },
  {
    province: "浙江省",
    cities: [
      { name: "杭州市", lat: 30.2741, lon: 120.1551 },
      { name: "宁波市", lat: 29.8683, lon: 121.5440 },
      { name: "温州市", lat: 27.9939, lon: 120.6994 },
      { name: "嘉兴市", lat: 30.7539, lon: 120.7585 },
      { name: "湖州市", lat: 30.8926, lon: 120.0958 },
      { name: "绍兴市", lat: 30.0300, lon: 120.5806 },
      { name: "金华市", lat: 29.0788, lon: 119.6497 },
    ],
  },
  {
    province: "江苏省",
    cities: [
      { name: "南京市", lat: 32.0603, lon: 118.7969 },
      { name: "苏州市", lat: 31.2990, lon: 120.5853 },
      { name: "无锡市", lat: 31.4912, lon: 120.3119 },
      { name: "常州市", lat: 31.8111, lon: 119.9742 },
      { name: "南通市", lat: 32.0603, lon: 120.8647 },
      { name: "徐州市", lat: 34.2610, lon: 117.1846 },
      { name: "扬州市", lat: 32.3943, lon: 119.4130 },
    ],
  },
  {
    province: "山东省",
    cities: [
      { name: "济南市", lat: 36.6512, lon: 117.1201 },
      { name: "青岛市", lat: 36.0671, lon: 120.3826 },
      { name: "烟台市", lat: 37.4639, lon: 121.4480 },
      { name: "潍坊市", lat: 36.7069, lon: 119.1618 },
      { name: "淄博市", lat: 36.8131, lon: 118.0548 },
      { name: "临沂市", lat: 35.1046, lon: 118.3564 },
    ],
  },
  {
    province: "四川省",
    cities: [
      { name: "成都市", lat: 30.5728, lon: 104.0668 },
      { name: "绵阳市", lat: 31.4679, lon: 104.6820 },
      { name: "德阳市", lat: 31.1270, lon: 104.3979 },
      { name: "宜宾市", lat: 28.7518, lon: 104.6418 },
      { name: "南充市", lat: 30.8373, lon: 106.1106 },
    ],
  },
  {
    province: "湖北省",
    cities: [
      { name: "武汉市", lat: 30.5928, lon: 114.3055 },
      { name: "宜昌市", lat: 30.6918, lon: 111.2864 },
      { name: "襄阳市", lat: 32.0422, lon: 112.1444 },
      { name: "荆州市", lat: 30.3261, lon: 112.2389 },
    ],
  },
  {
    province: "湖南省",
    cities: [
      { name: "长沙市", lat: 28.2282, lon: 112.9388 },
      { name: "株洲市", lat: 27.8277, lon: 113.1338 },
      { name: "岳阳市", lat: 29.3572, lon: 113.1289 },
      { name: "常德市", lat: 29.0316, lon: 111.6987 },
    ],
  },
  {
    province: "福建省",
    cities: [
      { name: "福州市", lat: 26.0745, lon: 119.2965 },
      { name: "厦门市", lat: 24.4798, lon: 118.0894 },
      { name: "泉州市", lat: 24.8741, lon: 118.6759 },
      { name: "漳州市", lat: 24.5130, lon: 117.6471 },
    ],
  },
  {
    province: "河南省",
    cities: [
      { name: "郑州市", lat: 34.7466, lon: 113.6253 },
      { name: "洛阳市", lat: 34.6197, lon: 112.4540 },
      { name: "南阳市", lat: 32.9991, lon: 112.5283 },
      { name: "许昌市", lat: 34.0219, lon: 113.8523 },
    ],
  },
  {
    province: "河北省",
    cities: [
      { name: "石家庄市", lat: 38.0428, lon: 114.5149 },
      { name: "唐山市", lat: 39.6292, lon: 118.1801 },
      { name: "保定市", lat: 38.8740, lon: 115.4646 },
      { name: "廊坊市", lat: 39.5168, lon: 116.6837 },
    ],
  },
  {
    province: "陕西省",
    cities: [
      { name: "西安市", lat: 34.3416, lon: 108.9398 },
      { name: "咸阳市", lat: 34.3296, lon: 108.7091 },
      { name: "宝鸡市", lat: 34.3619, lon: 107.2371 },
    ],
  },
  {
    province: "辽宁省",
    cities: [
      { name: "沈阳市", lat: 41.8057, lon: 123.4315 },
      { name: "大连市", lat: 38.9140, lon: 121.6147 },
      { name: "鞍山市", lat: 41.1100, lon: 122.9946 },
    ],
  },
  {
    province: "吉林省",
    cities: [
      { name: "长春市", lat: 43.8171, lon: 125.3235 },
      { name: "吉林市", lat: 43.8378, lon: 126.5497 },
    ],
  },
  {
    province: "黑龙江省",
    cities: [
      { name: "哈尔滨市", lat: 45.8038, lon: 126.5350 },
      { name: "大庆市", lat: 46.5907, lon: 125.1046 },
    ],
  },
  {
    province: "安徽省",
    cities: [
      { name: "合肥市", lat: 31.8206, lon: 117.2272 },
      { name: "芜湖市", lat: 31.3529, lon: 118.4331 },
      { name: "蚌埠市", lat: 32.9167, lon: 117.3887 },
    ],
  },
  {
    province: "江西省",
    cities: [
      { name: "南昌市", lat: 28.6820, lon: 115.8579 },
      { name: "赣州市", lat: 25.8312, lon: 114.9335 },
    ],
  },
  {
    province: "山西省",
    cities: [
      { name: "太原市", lat: 37.8706, lon: 112.5489 },
      { name: "大同市", lat: 40.0768, lon: 113.3001 },
    ],
  },
  {
    province: "云南省",
    cities: [
      { name: "昆明市", lat: 25.0389, lon: 102.7183 },
      { name: "大理市", lat: 25.5916, lon: 100.2250 },
      { name: "丽江市", lat: 26.8722, lon: 100.2180 },
    ],
  },
  {
    province: "贵州省",
    cities: [
      { name: "贵阳市", lat: 26.6470, lon: 106.6302 },
      { name: "遵义市", lat: 27.7254, lon: 106.9273 },
    ],
  },
  {
    province: "甘肃省",
    cities: [
      { name: "兰州市", lat: 36.0611, lon: 103.8343 },
    ],
  },
  {
    province: "海南省",
    cities: [
      { name: "海口市", lat: 20.0444, lon: 110.1999 },
      { name: "三亚市", lat: 18.2528, lon: 109.5120 },
    ],
  },
  {
    province: "内蒙古",
    cities: [
      { name: "呼和浩特市", lat: 40.8422, lon: 111.7500 },
      { name: "包头市", lat: 40.6571, lon: 109.8401 },
    ],
  },
  {
    province: "新疆",
    cities: [
      { name: "乌鲁木齐市", lat: 43.8256, lon: 87.6168 },
    ],
  },
  {
    province: "西藏",
    cities: [
      { name: "拉萨市", lat: 29.6500, lon: 91.1000 },
    ],
  },
  {
    province: "宁夏",
    cities: [
      { name: "银川市", lat: 38.4872, lon: 106.2309 },
    ],
  },
  {
    province: "青海省",
    cities: [
      { name: "西宁市", lat: 36.6171, lon: 101.7782 },
    ],
  },
  {
    province: "广西",
    cities: [
      { name: "南宁市", lat: 22.8170, lon: 108.3665 },
      { name: "桂林市", lat: 25.2736, lon: 110.2900 },
    ],
  },
  {
    province: "台湾省",
    cities: [
      { name: "台北市", lat: 25.0330, lon: 121.5654 },
    ],
  },
  {
    province: "香港",
    cities: [
      { name: "香港", lat: 22.3193, lon: 114.1694 },
    ],
  },
  {
    province: "澳门",
    cities: [
      { name: "澳门", lat: 22.1987, lon: 113.5439 },
    ],
  },
];
