import { BuildingInfo, FloorInfo, RoomData, IndustryShare, AirQualityData, WeeklyEnergy, RobotStatus } from '../types';
import { importedBuildings, importedFloors } from './importedCampus';
import cctvLobby from '../assets/images/cctv_lobby.jpg';
import cctvServer from '../assets/images/cctv_server.jpg';
import cctvPower from '../assets/images/cctv_power.jpg';
import cctvPark from '../assets/images/cctv_park.jpg';
import cctvGarage from '../assets/images/cctv_garage.jpg';
import cctvRooftop from '../assets/images/cctv_rooftop.jpg';
import {
  CAMPUS_BUILDINGS,
  B1A_FLOORS,
  B1A_INDUSTRY_SHARES,
  B1A_AIR_QUALITY,
  B1A_WEEKLY_ENERGY,
  B1A_FOOTFALL_TREND,
  B1A_METRICS,
  INITIAL_ROBOT_STATUS,
  PATROL_WAYPOINTS
} from '../data/campusData';

export type ObjectType = 'campus' | 'building' | 'floor' | 'room' | 'device';

export interface CCTVFeedItem {
  id: string;
  name: string;
  img: string;
  target: string;
  status: string;
}

export interface CampusEntity {
  modelSource?: 'obj';
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  district: string;
  tagline: string;
  description: string;
  totalArea: string;
  builtArea: string;
  occupancyRate: number;
  enterpriseCount: number;
  totalHeadcount: number;
  greenRate: string;
  energyGrade: string;
  mainBuildingId: string;
  buildings: BuildingInfo[];
  floorsMap: Record<string, FloorInfo[]>;
  industryShares: IndustryShare[];
  airQuality: AirQualityData;
  weeklyEnergy: WeeklyEnergy[];
  footfallTrend: { time: string; count: number }[];
  metrics: {
    comprehensiveIncome: string;
    roomCount: string;
    parkingSpaces: string;
    meetingRooms: string;
    totalArea: string;
    dailyVisitors: string;
  };
  cctvFeeds: CCTVFeedItem[];
  robotStatus: RobotStatus;
  patrolWaypoints: Array<{ name: string; pos: number[]; note: string }>;
}

/* =========================================================================
   1. 园区 1：安宸数智产业园 (AC-Tech Campus)
   ========================================================================= */
export const CAMPUS_AC_TECH: CampusEntity = {
  modelSource: 'obj',
  id: 'campus-ac-tech',
  name: '安宸数智产业园',
  code: 'AC-TECH-01',
  type: '人工智能与数智科创基地',
  city: '上海市',
  district: '浦东新区 · 张江创智港',
  tagline: '数字孪生驱动的高效绿色低碳示范园区',
  description: '园区依托高带宽光纤网与泛在物联感知神经，集聚人工智能软硬件、工业云与跨境科技领军企业。',
  totalArea: '32.8 万㎡',
  builtArea: '22.8 万㎡',
  occupancyRate: 94.6,
  enterpriseCount: 168,
  totalHeadcount: 14200,
  greenRate: '38.5%',
  energyGrade: 'LEED-CS 金级 / 绿建三星',
  mainBuildingId: 'obj-A',
  buildings: importedBuildings,
  floorsMap: importedFloors,
  industryShares: B1A_INDUSTRY_SHARES,
  airQuality: B1A_AIR_QUALITY,
  weeklyEnergy: B1A_WEEKLY_ENERGY,
  footfallTrend: B1A_FOOTFALL_TREND,
  metrics: B1A_METRICS,
  cctvFeeds: [
    { id: 'CAM-01', name: '大堂闸机口', img: cctvLobby, target: '人脸匹配 99.8%', status: '正常' },
    { id: 'CAM-02', name: '算力数据中心', img: cctvServer, target: '冷通道 21.4°C', status: '正常' },
    { id: 'CAM-03', name: '配电中控高压间', img: cctvPower, target: '热成像 38.6°C', status: '正常' },
    { id: 'CAM-04', name: '景观水系步道', img: cctvPark, target: 'AI周界 正常', status: '正常' },
    { id: 'CAM-05', name: '地下车库出入口', img: cctvGarage, target: '车位余量 328', status: '正常' },
    { id: 'CAM-06', name: '楼顶全景鹰眼', img: cctvRooftop, target: '360°高空巡视', status: '正常' },
  ],
  robotStatus: INITIAL_ROBOT_STATUS,
  patrolWaypoints: PATROL_WAYPOINTS
};

/* =========================================================================
   2. 园区 2：张江未来科创港 (ZJ-InnoPort)
   ========================================================================= */
const ZJ_BUILDINGS: BuildingInfo[] = [
  {
    id: 'zj-ic',
    code: 'IC-01',
    name: '先导芯片微电子大厦',
    type: '半导体集成电路研发',
    floorsCount: 7,
    area: '74,200 ㎡',
    occupancyRate: 98.2,
    position: [0, 0, 0],
    size: [14, 15, 18],
    color: '#0284c7',
    description: '承载3纳米/5纳米先导EDA仿真设计中心与晶圆测试洁净车间，全天候超净超纯微环境管控。',
    status: 'optimal',
    energyLevel: 'LEED 铂金级'
  },
  {
    id: 'zj-bio',
    code: 'BIO-02',
    name: '精准医疗与合成生物楼',
    type: '生物医药前沿研发',
    floorsCount: 6,
    area: '56,800 ㎡',
    occupancyRate: 95.1,
    position: [-22, 0, -6],
    size: [12, 13, 15],
    color: '#0ea5e9',
    description: '配备P3负压生防实验室、类器官高通量筛选中心与临床前转化药物研发公共服务平台。',
    status: 'normal',
    energyLevel: '绿色三星'
  },
  {
    id: 'zj-quant',
    code: 'QUANT-03',
    name: '量子计算工程研究院',
    type: '前沿硬核科学实验',
    floorsCount: 5,
    area: '43,000 ㎡',
    occupancyRate: 96.0,
    position: [22, 0, -4],
    size: [13, 11, 14],
    color: '#38bdf8',
    description: '超导量子计算低温稀释制冷试验集群与光量子芯片互联中试平台。',
    status: 'optimal',
    energyLevel: 'LEED 金级'
  },
  {
    id: 'zj-venture',
    code: 'VENTURE-04',
    name: '全球硬科技创新加速港',
    type: '创投孵化与知识产权',
    floorsCount: 4,
    area: '32,500 ㎡',
    occupancyRate: 91.4,
    position: [-16, 0, 16],
    size: [11, 9, 13],
    color: '#6366f1',
    description: '国际顶级科创基金与天使母基金联合办公区，提供出海合规与高端知识产权维权枢纽。',
    status: 'normal',
    energyLevel: '绿色二星'
  },
  {
    id: 'zj-forum',
    code: 'FORUM-05',
    name: '未来科学国际会展中心',
    type: '国际学术会展交流',
    floorsCount: 3,
    area: '29,400 ㎡',
    occupancyRate: 93.8,
    position: [17, 0, 15],
    size: [12, 7, 12],
    color: '#0284c7',
    description: '具备全球同传的顶尖科学家交流会堂与沉浸式全息学术路演发布中心。',
    status: 'optimal',
    energyLevel: 'LEED 金级'
  }
];

const ZJ_FLOORS: FloorInfo[] = [
  {
    floorNumber: 7,
    label: 'F7',
    height: 12.6,
    purpose: '院士工作站与量子战略决策中心',
    tenantCount: 6,
    area: 7800,
    energyToday: 1940,
    rooms: []
  },
  {
    floorNumber: 6,
    label: 'F6',
    height: 10.5,
    purpose: 'EDA算法编译器与IP核集成实验室',
    tenantCount: 12,
    area: 8800,
    energyToday: 2420,
    rooms: []
  },
  {
    floorNumber: 5,
    label: 'F5',
    height: 8.4,
    purpose: '集成电路硅光子与存算一体先进芯片工程中心',
    tenantCount: 16,
    area: 9600,
    energyToday: 2690,
    rooms: [
      {
        id: 'zj-r-501',
        floor: 5,
        roomNumber: '501',
        enterpriseName: '中微先导光电科技有限公司 (硅光子实验室)',
        category: '前沿实验',
        usableArea: 1520,
        headcount: 640,
        temperature: 21.8,
        humidity: 43,
        dailyRent: 8.6,
        contractExpiry: '2029-05-31',
        powerUsage: 540,
        status: '恒温恒湿中',
        position: [-3.2, 0, -3.2],
        size: [6.5, 1.8, 6.2],
        color: '#0284c7'
      },
      {
        id: 'zj-r-502',
        floor: 5,
        roomNumber: '502',
        enterpriseName: '张江RISC-V开源生态产业联盟联合中心',
        category: '研发办公',
        usableArea: 720,
        headcount: 180,
        temperature: 22.5,
        humidity: 46,
        dailyRent: 7.9,
        contractExpiry: '2028-10-15',
        powerUsage: 480,
        status: '正常办公',
        position: [3.4, 0, -3.2],
        size: [5.8, 1.8, 6.2],
        color: '#0369a1'
      },
      {
        id: 'zj-r-503',
        floor: 5,
        roomNumber: '503',
        enterpriseName: '国际集成电路微架构验证研讨厅',
        category: '会议中心',
        usableArea: 460,
        headcount: 200,
        temperature: 23.2,
        humidity: 48,
        dailyRent: 9.2,
        contractExpiry: '2030-12-31',
        powerUsage: 210,
        status: '会议进行中',
        position: [-3.2, 0, 3.4],
        size: [6.5, 1.8, 5.8],
        color: '#0ea5e9'
      },
      {
        id: 'zj-r-504',
        floor: 5,
        roomNumber: '504',
        enterpriseName: '先进封装与异构集成创客工位群',
        category: '研发办公',
        usableArea: 890,
        headcount: 290,
        temperature: 23.5,
        humidity: 45,
        dailyRent: 7.5,
        contractExpiry: '2027-04-20',
        powerUsage: 360,
        status: '正常办公',
        position: [3.4, 0, 3.4],
        size: [5.8, 1.8, 5.8],
        color: '#0284c7'
      },
      {
        id: 'zj-r-505',
        floor: 5,
        roomNumber: '505',
        enterpriseName: '量子硅基科学家休闲沙龙 & 氧吧',
        category: '休闲配套',
        usableArea: 380,
        headcount: 50,
        temperature: 24.0,
        humidity: 50,
        dailyRent: 6.2,
        contractExpiry: '2030-06-30',
        powerUsage: 160,
        status: '正常办公',
        position: [0, 0, 0],
        size: [2.8, 1.8, 3.2],
        color: '#10b981'
      }
    ]
  },
  { floorNumber: 4, label: 'F4', height: 6.3, purpose: '高精数模混合集成测试中心', tenantCount: 20, area: 9800, energyToday: 2510, rooms: [] },
  { floorNumber: 3, label: 'F3', height: 4.2, purpose: '晶圆良率大数据智能分析区', tenantCount: 24, area: 10100, energyToday: 2680, rooms: [] },
  { floorNumber: 2, label: 'F2', height: 2.1, purpose: '保税研发与海关通关一站式服务厅', tenantCount: 28, area: 10400, energyToday: 2350, rooms: [] },
  { floorNumber: 1, label: 'F1', height: 0, purpose: '芯创世界科技展厅与芯片发布大厅', tenantCount: 32, area: 10800, energyToday: 3450, rooms: [] }
];

export const CAMPUS_ZJ_INNO: CampusEntity = {
  id: 'campus-zj-inno',
  name: '张江未来科创港',
  code: 'ZJ-INNO-02',
  type: '集成电路与生物医药先导港',
  city: '上海市',
  district: '浦东新区 · 张江科学城高科中路',
  tagline: '硬核科技突破与原始创新策源高地',
  description: '围绕国家重大科技专项，布局集成电路核心器件、合成生物学与量子计算前沿产业。',
  totalArea: '28.5 万㎡',
  builtArea: '23.6 万㎡',
  occupancyRate: 96.8,
  enterpriseCount: 142,
  totalHeadcount: 12600,
  greenRate: '42.0%',
  energyGrade: 'LEED 铂金级',
  mainBuildingId: 'zj-ic',
  buildings: ZJ_BUILDINGS,
  floorsMap: {
    'zj-ic': ZJ_FLOORS
  },
  industryShares: [
    { name: '集成电路芯片', percentage: 42, color: '#38bdf8', revenueShare: '12,450 万元' },
    { name: '生物医药与合成科学', percentage: 26, color: '#0ea5e9', revenueShare: '7,820 万元' },
    { name: '量子信息与前沿算法', percentage: 16, color: '#0284c7', revenueShare: '4,960 万元' },
    { name: '硬科技风投与法律', percentage: 10, color: '#6366f1', revenueShare: '3,120 万元' },
    { name: '国际会展与服务配套', percentage: 6, color: '#10b981', revenueShare: '1,880 万元' }
  ],
  airQuality: {
    aqi: 28,
    aqiLevel: '优',
    pm25: 11,
    pm10: 22,
    co: 0.5,
    so2: 3,
    no2: 15,
    temp: 22.8,
    humidity: 45
  },
  weeklyEnergy: [
    { day: '周一', electricity: 16200, water: 520, cooling: 9400 },
    { day: '周二', electricity: 17800, water: 560, cooling: 10100 },
    { day: '周三', electricity: 18400, water: 580, cooling: 10500 },
    { day: '周四', electricity: 17900, water: 550, cooling: 10200 },
    { day: '周五', electricity: 17100, water: 530, cooling: 9800 },
    { day: '周六', electricity: 8400,  water: 280, cooling: 4800 },
    { day: '周日', electricity: 7200,  water: 220, cooling: 4200 }
  ],
  footfallTrend: [
    { time: '06:00', count: 180 },
    { time: '08:00', count: 1240 },
    { time: '09:00', count: 2890 },
    { time: '10:00', count: 3560 },
    { time: '12:00', count: 3120 },
    { time: '14:00', count: 3820 },
    { time: '16:00', count: 3450 },
    { time: '18:00', count: 3280 },
    { time: '20:00', count: 1560 },
    { time: '22:00', count: 520 }
  ],
  metrics: {
    comprehensiveIncome: '¥ 3.12 亿元/年',
    roomCount: '158 间',
    parkingSpaces: '820 个',
    meetingRooms: '42 间',
    totalArea: '74,200 ㎡',
    dailyVisitors: '5,620 人次'
  },
  cctvFeeds: [
    { id: 'CAM-01', name: '洁净室安检闸机', img: cctvLobby, target: '静电手环与人脸 99.9%', status: '正常' },
    { id: 'CAM-02', name: 'EDA算力刀片中心', img: cctvServer, target: '超算机架 20.8°C', status: '正常' },
    { id: 'CAM-03', name: '千伏超纯变电站', img: cctvPower, target: '红外测温 36.2°C', status: '正常' },
    { id: 'CAM-04', name: '未来科学大道', img: cctvPark, target: '智能巡逻 正常', status: '正常' },
    { id: 'CAM-05', name: '自动泊车地库', img: cctvGarage, target: '自动导引 空位412', status: '正常' },
    { id: 'CAM-06', name: '芯片楼顶气象云台', img: cctvRooftop, target: '全域风速监控 正常', status: '正常' }
  ],
  robotStatus: {
    id: 'ROBOT-ZJ-ALPHA',
    model: 'AlphaBot 洁净智能巡视车',
    speed: 5.2,
    battery: 94,
    heading: 68,
    status: 'patrolling',
    currentWaypoint: 'WP-02 芯片先导走廊',
    totalWaypoints: 8,
    lidarStatus: 'OK',
    thermalStatus: 'NORMAL',
    signal: '5G-A 8ms'
  },
  patrolWaypoints: [
    { name: 'WP-01 芯片大厦晶圆前廊', pos: [12, 0.4, 18], note: '空气洁净度 Class 1000' },
    { name: 'WP-02 科学家林荫步道', pos: [16, 0.4, 6], note: '微气候良好，负氧离子 2800个/cm³' },
    { name: 'WP-03 生物医药负压实验区', pos: [14, 0.4, -10], note: '排风监测压差稳定' },
    { name: 'WP-04 量子中心超导制冷机组', pos: [0, 0.4, -4], note: '无水冷循环泄漏' },
    { name: 'WP-05 芯片大厦正门迎宾廊', pos: [0, 0.4, 8], note: '人员通行平稳' },
    { name: 'WP-06 硬科技孵化港前坪', pos: [-14, 0.4, 8], note: '户外光伏充电桩正常' },
    { name: 'WP-07 未来科创峰会大厅南', pos: [-16, 0.4, 18], note: '高清大屏预热就绪' },
    { name: 'WP-08 园区智慧水岸绿道', pos: [0, 0.4, 18], note: '周界红外零报警' }
  ]
};

/* =========================================================================
   3. 园区 3：临港数字孪生智造谷 (LG-SmartValley)
   ========================================================================= */
const LG_BUILDINGS: BuildingInfo[] = [
  {
    id: 'lg-ev',
    code: 'EV-01',
    name: '智能网联车智造总部',
    type: '智能座舱与自动驾驶研发',
    floorsCount: 7,
    area: '82,000 ㎡',
    occupancyRate: 97.5,
    position: [0, 0, 0],
    size: [14, 15, 18],
    color: '#0284c7',
    description: '集成L4自动驾驶车载超算、一体化压铸车身研发与低空飞行汽车试验平台。',
    status: 'optimal',
    energyLevel: '绿色三星'
  },
  {
    id: 'lg-iot',
    code: 'IOT-02',
    name: '工业互联网数字化灯塔中心',
    type: '工业软件与数字孪生',
    floorsCount: 6,
    area: '61,200 ㎡',
    occupancyRate: 94.0,
    position: [-22, 0, -6],
    size: [12, 13, 15],
    color: '#0ea5e9',
    description: '接入全球超过120万台智能装备工业网关，毫秒级数字孪生车间实时仿真。',
    status: 'normal',
    energyLevel: 'LEED 金级'
  },
  {
    id: 'lg-robot',
    code: 'ROBOT-03',
    name: '具身智能人形机器人研发港',
    type: '机器人本体与运控算法',
    floorsCount: 5,
    area: '48,600 ㎡',
    occupancyRate: 98.6,
    position: [22, 0, -4],
    size: [13, 11, 14],
    color: '#38bdf8',
    description: '高精度伺服电机、减速器力矩试验台与通用人形机器人工业作业仿真训练场。',
    status: 'optimal',
    energyLevel: 'LEED 银级'
  },
  {
    id: 'lg-logi',
    code: 'LOGI-04',
    name: '5G无人智慧仓储枢纽',
    type: '无人智能物流枢纽',
    floorsCount: 4,
    area: '38,000 ㎡',
    occupancyRate: 92.0,
    position: [-16, 0, 16],
    size: [11, 9, 13],
    color: '#6366f1',
    description: '配备四向穿梭车立体库、AGV矩阵调度中心与全自动装卸无人重卡通道。',
    status: 'normal',
    energyLevel: '绿色二星'
  },
  {
    id: 'lg-expo',
    code: 'EXPO-05',
    name: '现代装备工业数字博览中心',
    type: '装备博览与学术交流',
    floorsCount: 3,
    area: '31,000 ㎡',
    occupancyRate: 96.2,
    position: [17, 0, 15],
    size: [12, 7, 12],
    color: '#0284c7',
    description: '世界顶尖智能制造大奖展示馆与跨国装备采购发布常年展贸中心。',
    status: 'optimal',
    energyLevel: 'LEED 金级'
  }
];

const LG_FLOORS: FloorInfo[] = [
  { floorNumber: 7, label: 'F7', height: 12.6, purpose: '智造谷战略指挥与全球车联网大屏中心', tenantCount: 7, area: 8200, energyToday: 2100, rooms: [] },
  { floorNumber: 6, label: 'F6', height: 10.5, purpose: '高阶自动驾驶端到端神经网络模型训练场', tenantCount: 15, area: 9200, energyToday: 2580, rooms: [] },
  {
    floorNumber: 5,
    label: 'F5',
    height: 8.4,
    purpose: '智能座舱全场景人机共驾与域控中枢试验层',
    tenantCount: 19,
    area: 9900,
    energyToday: 2840,
    rooms: [
      {
        id: 'lg-r-501',
        floor: 5,
        roomNumber: '501',
        enterpriseName: '蔚来智行新能源汽车智能座舱研究院',
        category: '研发办公',
        usableArea: 1600,
        headcount: 780,
        temperature: 23.0,
        humidity: 47,
        dailyRent: 7.2,
        contractExpiry: '2029-12-31',
        powerUsage: 510,
        status: '正常办公',
        position: [-3.2, 0, -3.2],
        size: [6.5, 1.8, 6.2],
        color: '#0284c7'
      },
      {
        id: 'lg-r-502',
        floor: 5,
        roomNumber: '502',
        enterpriseName: '工信部车规级域控制器安全可靠性实验室',
        category: '前沿实验',
        usableArea: 750,
        headcount: 140,
        temperature: 22.2,
        humidity: 44,
        dailyRent: 8.0,
        contractExpiry: '2028-06-30',
        powerUsage: 620,
        status: '恒温恒湿中',
        position: [3.4, 0, -3.2],
        size: [5.8, 1.8, 6.2],
        color: '#0369a1'
      },
      {
        id: 'lg-r-503',
        floor: 5,
        roomNumber: '503',
        enterpriseName: '全向环境模拟车路云协同研讨会堂',
        category: '会议中心',
        usableArea: 440,
        headcount: 180,
        temperature: 23.4,
        humidity: 49,
        dailyRent: 8.8,
        contractExpiry: '2030-08-31',
        powerUsage: 195,
        status: '会议进行中',
        position: [-3.2, 0, 3.4],
        size: [6.5, 1.8, 5.8],
        color: '#0ea5e9'
      },
      {
        id: 'lg-r-504',
        floor: 5,
        roomNumber: '504',
        enterpriseName: '线控底盘与低空飞行器孵化联合办公区',
        category: '研发办公',
        usableArea: 920,
        headcount: 310,
        temperature: 23.8,
        humidity: 46,
        dailyRent: 6.9,
        contractExpiry: '2027-11-15',
        powerUsage: 340,
        status: '正常办公',
        position: [3.4, 0, 3.4],
        size: [5.8, 1.8, 5.8],
        color: '#0284c7'
      },
      {
        id: 'lg-r-505',
        floor: 5,
        roomNumber: '505',
        enterpriseName: '特斯拉生态工程技术专家交流吧',
        category: '休闲配套',
        usableArea: 360,
        headcount: 48,
        temperature: 24.2,
        humidity: 51,
        dailyRent: 5.8,
        contractExpiry: '2029-09-30',
        powerUsage: 150,
        status: '正常办公',
        position: [0, 0, 0],
        size: [2.8, 1.8, 3.2],
        color: '#10b981'
      }
    ]
  },
  { floorNumber: 4, label: 'F4', height: 6.3, purpose: '高压电驱与电池管理BMS验证中枢', tenantCount: 22, area: 10200, energyToday: 2620, rooms: [] },
  { floorNumber: 3, label: 'F3', height: 4.2, purpose: '智能网联车仿真雷达与光学暗室', tenantCount: 25, area: 10500, energyToday: 2790, rooms: [] },
  { floorNumber: 2, label: 'F2', height: 2.1, purpose: '临港自贸区新片区高端产业扶持政策厅', tenantCount: 30, area: 10800, energyToday: 2420, rooms: [] },
  { floorNumber: 1, label: 'F1', height: 0, purpose: '概念超跑展厅、数字试车道与接待大堂', tenantCount: 34, area: 11200, energyToday: 3680, rooms: [] }
];

export const CAMPUS_LG_SMART: CampusEntity = {
  id: 'campus-lg-smart',
  name: '临港数字孪生智造谷',
  code: 'LG-SMART-03',
  type: '高端装备与新能源智能网联汽车谷',
  city: '上海市',
  district: '浦东新区 · 临港新片区重装备产业区',
  tagline: '国际先进智能制造与工业互联网示范高地',
  description: '汇聚中国高端装备制造、低空经济、新能源汽车整车研发与无人仓储领头羊。',
  totalArea: '45.2 万㎡',
  builtArea: '31.5 万㎡',
  occupancyRate: 97.2,
  enterpriseCount: 215,
  totalHeadcount: 18400,
  greenRate: '35.0%',
  energyGrade: '国家绿色建筑三星',
  mainBuildingId: 'lg-ev',
  buildings: LG_BUILDINGS,
  floorsMap: {
    'lg-ev': LG_FLOORS
  },
  industryShares: [
    { name: '智能网联汽车', percentage: 46, color: '#38bdf8', revenueShare: '16,280 万元' },
    { name: '工业互联网与机器人', percentage: 24, color: '#0ea5e9', revenueShare: '8,490 万元' },
    { name: '高端智能装备', percentage: 15, color: '#0284c7', revenueShare: '5,320 万元' },
    { name: '绿色储能与电池', percentage: 9, color: '#6366f1', revenueShare: '3,180 万元' },
    { name: '现代物流与会展', percentage: 6, color: '#10b981', revenueShare: '2,120 万元' }
  ],
  airQuality: {
    aqi: 25,
    aqiLevel: '优',
    pm25: 9,
    pm10: 18,
    co: 0.4,
    so2: 2,
    no2: 12,
    temp: 21.5,
    humidity: 52
  },
  weeklyEnergy: [
    { day: '周一', electricity: 18900, water: 610, cooling: 11200 },
    { day: '周二', electricity: 20400, water: 650, cooling: 12100 },
    { day: '周三', electricity: 21100, water: 680, cooling: 12500 },
    { day: '周四', electricity: 20600, water: 640, cooling: 12200 },
    { day: '周五', electricity: 19800, water: 620, cooling: 11800 },
    { day: '周六', electricity: 9600,  water: 310, cooling: 5600 },
    { day: '周日', electricity: 8100,  water: 250, cooling: 4900 }
  ],
  footfallTrend: [
    { time: '06:00', count: 240 },
    { time: '08:00', count: 1890 },
    { time: '09:00', count: 3620 },
    { time: '10:00', count: 4120 },
    { time: '12:00', count: 3840 },
    { time: '14:00', count: 4350 },
    { time: '16:00', count: 3980 },
    { time: '18:00', count: 3720 },
    { time: '20:00', count: 1940 },
    { time: '22:00', count: 680 }
  ],
  metrics: {
    comprehensiveIncome: '¥ 3.86 亿元/年',
    roomCount: '186 间',
    parkingSpaces: '1,150 个',
    meetingRooms: '52 间',
    totalArea: '82,000 ㎡',
    dailyVisitors: '6,850 人次'
  },
  cctvFeeds: [
    { id: 'CAM-01', name: '无人车试验车道', img: cctvLobby, target: '路测感知 正常', status: '正常' },
    { id: 'CAM-02', name: '数字孪生超算中枢', img: cctvServer, target: '算力机房 20.2°C', status: '正常' },
    { id: 'CAM-03', name: '智能配电主变压组', img: cctvPower, target: '变压器 37.1°C', status: '正常' },
    { id: 'CAM-04', name: '临港滴水湖观景带', img: cctvPark, target: '电子围栏 0告警', status: '正常' },
    { id: 'CAM-05', name: 'AGV物流重卡道口', img: cctvGarage, target: '车牌感知: 沪A·9982D', status: '正常' },
    { id: 'CAM-06', name: '总部楼顶全景光电', img: cctvRooftop, target: '高空防抛物 正常', status: '正常' }
  ],
  robotStatus: {
    id: 'ROBOT-LG-TITAN-X',
    model: 'Titan-X 重载轮式巡检车',
    speed: 5.6,
    battery: 92,
    heading: 115,
    status: 'patrolling',
    currentWaypoint: 'WP-01 重卡出入港道',
    totalWaypoints: 8,
    lidarStatus: 'OK',
    thermalStatus: 'NORMAL',
    signal: '5G RedCap 9ms'
  },
  patrolWaypoints: [
    { name: 'WP-01 智造总部研发主廊', pos: [12, 0.4, 18], note: '智能网联车实时路测中' },
    { name: 'WP-02 工业数字孪生大厦前', pos: [16, 0.4, 6], note: '光纤传感器信号良好' },
    { name: 'WP-03 机器人试验枢纽环道', pos: [14, 0.4, -10], note: '具身机器人算法校准中' },
    { name: 'WP-04 智能中央蓄能水体', pos: [0, 0.4, -4], note: '热泵循环正常' },
    { name: 'WP-05 智造总部东门出入口', pos: [0, 0.4, 8], note: '无人重卡有序放行' },
    { name: 'WP-06 无人立体仓储接驳区', pos: [-14, 0.4, 8], note: 'AGV穿梭车道通畅' },
    { name: 'WP-07 装备博览馆前展区', pos: [-16, 0.4, 18], note: '光伏储能电站并网中' },
    { name: 'WP-08 临港风貌绿化长廊', pos: [0, 0.4, 18], note: '微气候环境优良' }
  ]
};

/* =========================================================================
   面向对象的园区实体注册表 (Campus Registry)
   ========================================================================= */
export const ALL_CAMPUSES: CampusEntity[] = [
  CAMPUS_AC_TECH,
  CAMPUS_ZJ_INNO,
  CAMPUS_LG_SMART
];

export class CampusManager {
  private static activeCampusId: string = 'campus-ac-tech';

  public static getCampuses(): CampusEntity[] {
    return ALL_CAMPUSES;
  }

  public static getCampus(id: string): CampusEntity {
    return ALL_CAMPUSES.find(c => c.id === id) || ALL_CAMPUSES[0];
  }

  public static getActiveCampus(): CampusEntity {
    return this.getCampus(this.activeCampusId);
  }

  public static setActiveCampus(id: string) {
    this.activeCampusId = id;
  }

  public static getBuilding(campus: CampusEntity, buildingId: string): BuildingInfo | undefined {
    return campus.buildings.find(b => b.id === buildingId);
  }

  public static getFloors(campus: CampusEntity, buildingId: string): FloorInfo[] {
    return campus.floorsMap[buildingId] || campus.floorsMap[campus.mainBuildingId] || B1A_FLOORS;
  }

  public static getRooms(campus: CampusEntity, buildingId: string, floorNumber: number): RoomData[] {
    const floors = this.getFloors(campus, buildingId);
    const floor = floors.find(f => f.floorNumber === floorNumber);
    return floor?.rooms || [];
  }
}
