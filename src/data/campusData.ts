import { BuildingInfo, IndustryShare, AirQualityData, WeeklyEnergy, FloorInfo, RobotStatus } from '../types';

export const CAMPUS_BUILDINGS: BuildingInfo[] = [
  {
    id: 'b1-a',
    code: 'B1-A',
    name: '总部研发综合大楼',
    type: '总部科创办公',
    floorsCount: 7,
    area: '68,500 ㎡',
    occupancyRate: 96.4,
    position: [0, 0, 0],
    size: [14, 15, 18],
    color: '#0284c7',
    description: '园区核心地标综合体，汇聚石油勘测设计、人工智能前沿实验室及跨国科技研发中心。',
    status: 'optimal',
    energyLevel: 'LEED 金级'
  },
  {
    id: 'b5-b',
    code: 'B5-B',
    name: '数字算力创新中心',
    type: '大数据与算力中心',
    floorsCount: 6,
    area: '52,300 ㎡',
    occupancyRate: 92.8,
    position: [-22, 0, -6],
    size: [12, 13, 15],
    color: '#0369a1',
    description: '承载高精算力集群与云端基础设施，双路独立市电+柴油发电机组保障。',
    status: 'normal',
    energyLevel: '绿色三星'
  },
  {
    id: 'b2-b',
    code: 'B2-B',
    name: '金融与投资服务大厦',
    type: '现代金融商办',
    floorsCount: 5,
    area: '45,800 ㎡',
    occupancyRate: 98.1,
    position: [22, 0, -4],
    size: [13, 11, 14],
    color: '#0284c7',
    description: '包含国际创投基金、银行园区支行、财税及法律咨询专业服务矩阵。',
    status: 'optimal',
    energyLevel: 'LEED 银级'
  },
  {
    id: 'c3-a',
    code: 'C3-A',
    name: '独角兽企业孵化港',
    type: '创业孵化基地',
    floorsCount: 4,
    area: '34,200 ㎡',
    occupancyRate: 88.5,
    position: [-16, 0, 16],
    size: [11, 9, 13],
    color: '#0ea5e9',
    description: '为早期高成长型科技团队提供共享实验设备、开放工位及路演中心。',
    status: 'normal',
    energyLevel: '绿色二星'
  },
  {
    id: 'a1-s',
    code: 'A1-S',
    name: '国际交流与展示中心',
    type: '会展及综合配套',
    floorsCount: 3,
    area: '26,700 ㎡',
    occupancyRate: 95.0,
    position: [17, 0, 15],
    size: [12, 7, 12],
    color: '#38bdf8',
    description: '配备800人多功能学术报告厅、元宇宙数字展厅及高端商务宴会配套。',
    status: 'optimal',
    energyLevel: 'LEED 金级'
  }
];

export const B1A_INDUSTRY_SHARES: IndustryShare[] = [
  { name: '金融业', percentage: 35, color: '#38bdf8', revenueShare: '8,680 万元' },
  { name: '服务业', percentage: 22, color: '#0ea5e9', revenueShare: '5,450 万元' },
  { name: '工作室/高新研发', percentage: 18, color: '#0284c7', revenueShare: '4,460 万元' },
  { name: '政府/公共事业', percentage: 15, color: '#6366f1', revenueShare: '3,720 万元' },
  { name: '商业与零售配套', percentage: 10, color: '#10b981', revenueShare: '2,480 万元' },
];

export const B1A_AIR_QUALITY: AirQualityData = {
  aqi: 32,
  aqiLevel: '优',
  pm25: 14,
  pm10: 28,
  co: 0.6,
  so2: 4,
  no2: 18,
  temp: 23.6,
  humidity: 47
};

export const B1A_WEEKLY_ENERGY: WeeklyEnergy[] = [
  { day: '周一', electricity: 14200, water: 480, cooling: 8200 },
  { day: '周二', electricity: 15800, water: 510, cooling: 8900 },
  { day: '周三', electricity: 16100, water: 530, cooling: 9100 },
  { day: '周四', electricity: 15400, water: 490, cooling: 8700 },
  { day: '周五', electricity: 14900, water: 470, cooling: 8400 },
  { day: '周六', electricity: 7200,  water: 240, cooling: 4100 },
  { day: '周日', electricity: 6100,  water: 190, cooling: 3600 },
];

export const B1A_FOOTFALL_TREND = [
  { time: '06:00', count: 120 },
  { time: '08:00', count: 980 },
  { time: '09:00', count: 2450 },
  { time: '10:00', count: 3120 },
  { time: '12:00', count: 2840 },
  { time: '14:00', count: 3380 },
  { time: '16:00', count: 3010 },
  { time: '18:00', count: 2950 },
  { time: '20:00', count: 1240 },
  { time: '22:00', count: 360 },
];

export const B1A_METRICS = {
  comprehensiveIncome: '¥ 2.48 亿元/年',
  roomCount: '142 间',
  parkingSpaces: '680 个',
  meetingRooms: '36 间',
  totalArea: '68,500 ㎡',
  dailyVisitors: '4,890 人次'
};

export const B1A_FLOORS: FloorInfo[] = [
  {
    floorNumber: 7,
    label: 'F7',
    height: 12.6,
    purpose: '高管会务与全景商务交流中心',
    tenantCount: 8,
    area: 7200,
    energyToday: 1820,
    rooms: []
  },
  {
    floorNumber: 6,
    label: 'F6',
    height: 10.5,
    purpose: '云原生人工智能战略研发区',
    tenantCount: 14,
    area: 8400,
    energyToday: 2150,
    rooms: []
  },
  {
    floorNumber: 5,
    label: 'F5',
    height: 8.4,
    purpose: '石油勘测与新能源数字化研究所',
    tenantCount: 18,
    area: 9100,
    energyToday: 2480,
    rooms: [
      {
        id: 'r-501',
        floor: 5,
        roomNumber: '501',
        enterpriseName: '石油勘测设计院 (华东数字中心)',
        category: '研发办公',
        usableArea: 1456,
        headcount: 856,
        temperature: 23.5,
        humidity: 48,
        dailyRent: 6.8,
        contractExpiry: '2028-12-31',
        powerUsage: 412,
        status: '正常办公',
        position: [-3.2, 0, -3.2],
        size: [6.5, 1.8, 6.2],
        color: '#0284c7'
      },
      {
        id: 'r-502',
        floor: 5,
        roomNumber: '502',
        enterpriseName: '智算前沿与大模型赋能联合实验室',
        category: '前沿实验',
        usableArea: 680,
        headcount: 120,
        temperature: 22.0,
        humidity: 45,
        dailyRent: 7.2,
        contractExpiry: '2027-08-15',
        powerUsage: 680,
        status: '正常办公',
        position: [3.4, 0, -3.2],
        size: [5.8, 1.8, 6.2],
        color: '#0369a1'
      },
      {
        id: 'r-503',
        floor: 5,
        roomNumber: '503',
        enterpriseName: '环球全景多功能会议研讨中心',
        category: '会议中心',
        usableArea: 420,
        headcount: 160,
        temperature: 23.0,
        humidity: 50,
        dailyRent: 8.5,
        contractExpiry: '2030-01-01',
        powerUsage: 190,
        status: '会议进行中',
        position: [-3.2, 0, 3.4],
        size: [6.5, 1.8, 5.8],
        color: '#0ea5e9'
      },
      {
        id: 'r-504',
        floor: 5,
        roomNumber: '504',
        enterpriseName: '极客开放协同办公区 & 孵化工位',
        category: '研发办公',
        usableArea: 980,
        headcount: 320,
        temperature: 24.1,
        humidity: 46,
        dailyRent: 6.5,
        contractExpiry: '2026-11-20',
        powerUsage: 320,
        status: '正常办公',
        position: [3.4, 0, 3.4],
        size: [5.8, 1.8, 5.8],
        color: '#0284c7'
      },
      {
        id: 'r-505',
        floor: 5,
        roomNumber: '505',
        enterpriseName: '智享生态咖啡吧与员工茶歇空间',
        category: '休闲配套',
        usableArea: 350,
        headcount: 45,
        temperature: 24.5,
        humidity: 52,
        dailyRent: 5.5,
        contractExpiry: '2029-06-30',
        powerUsage: 140,
        status: '正常办公',
        position: [0, 0, 0],
        size: [2.8, 1.8, 3.2],
        color: '#10b981'
      }
    ]
  },
  {
    floorNumber: 4,
    label: 'F4',
    height: 6.3,
    purpose: '现代金融创新与跨境资本结算中心',
    tenantCount: 22,
    area: 9400,
    energyToday: 2310,
    rooms: []
  },
  {
    floorNumber: 3,
    label: 'F3',
    height: 4.2,
    purpose: '智能物联网与硬件系统测试区',
    tenantCount: 24,
    area: 9600,
    energyToday: 2540,
    rooms: []
  },
  {
    floorNumber: 2,
    label: 'F2',
    height: 2.1,
    purpose: '政企一站式联合服务大厅 & 知识产权所',
    tenantCount: 26,
    area: 9800,
    energyToday: 2190,
    rooms: []
  },
  {
    floorNumber: 1,
    label: 'F1',
    height: 0,
    purpose: '中央接待大堂、数字化展厅与商务综合零售',
    tenantCount: 30,
    area: 10200,
    energyToday: 3200,
    rooms: []
  }
];

export const INITIAL_ROBOT_STATUS: RobotStatus = {
  id: 'ROBOT-TITAN-07',
  model: 'Titan-07 巡检无人车',
  speed: 4.78,
  battery: 89,
  heading: 42,
  status: 'patrolling',
  currentWaypoint: 'WP-04 中央水景环线',
  totalWaypoints: 8,
  lidarStatus: 'OK',
  thermalStatus: 'NORMAL',
  signal: '5G NSA 11ms'
};

export const PATROL_WAYPOINTS = [
  { name: 'WP-01 东侧林荫主干道', pos: [12, 0.4, 18], note: '路面环境平整，照度 340 Lux' },
  { name: 'WP-02 A1-S国际会展前廊', pos: [16, 0.4, 6], note: '红外测温正常，人员有序' },
  { name: 'WP-03 B2-B金融大厦迎宾区', pos: [14, 0.4, -10], note: '智能闸机运转正常，通行顺畅' },
  { name: 'WP-04 中央水景喷泉环岛', pos: [0, 0.4, -4], note: '水体微循环泵运行平稳，水温 18.2℃' },
  { name: 'WP-05 B1-A总部科技大堂主入口', pos: [0, 0.4, 8], note: '自动感应门响应灵敏，空气清新' },
  { name: 'WP-06 B5-B算力楼北侧回车港', pos: [-14, 0.4, 8], note: '充电桩使用率 65%，消防通道畅通' },
  { name: 'WP-07 C3-A创客广场南区', pos: [-16, 0.4, 18], note: '户外无线AP负载正常' },
  { name: 'WP-08 景观绿道交汇处', pos: [0, 0.4, 18], note: '喷灌系统就绪，环境湿度 55%' }
];
