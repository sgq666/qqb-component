import { CheckPoint, CheckInRecord, CheckInRule } from "./types";

// 初始化打卡点数据
export const initialCheckPoints: CheckPoint[] = [
  {
    id: "1",
    name: "公司大门",
    latitude: 39.9042,
    longitude: 116.4074,
    description: "公司正门入口",
    createdAt: "2023-01-01",
  },
];

// 初始化打卡记录数据
export const initialCheckInRecords: CheckInRecord[] = [
  {
    id: "1",
    checkpointId: "1",
    checkpointName: "公司大门",
    latitude: 39.9042,
    longitude: 116.4074,
    checkTime: "2023-01-01 09:00:00",
    remark: "按时上班打卡",
    photoUrls: [],
    status: "success",
    distance: 50,
  },
];

// 初始化打卡规则数据
export const initialCheckInRules: CheckInRule[] = [
  {
    id: "1",
    checkpointId: "1",
    frequency: "daily",
    timeRange: ["08:00", "09:30"],
    maxDistance: 100,
    enabled: true,
  },
];

// 初始化统计数据
export const initialStatistics = {
  totalCheckIns: 120,
  successRate: 98.3,
  avgDistance: 45.2,
};