// 定义打卡点接口
export interface CheckPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl?: string;
  createdAt: string;
}

// 定义打卡记录接口
export interface CheckInRecord {
  id: string;
  checkpointId: string;
  checkpointName: string;
  latitude: number;
  longitude: number;
  checkTime: string;
  remark?: string;
  photoUrls: string[];
  status: "success" | "failed";
  distance: number;
}

// 定义打卡规则接口
export interface CheckInRule {
  id: string;
  checkpointId: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  timeRange: [string, string]; // [开始时间, 结束时间]
  maxDistance: number; // 最大距离(米)
  enabled: boolean;
}