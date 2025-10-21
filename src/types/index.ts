export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  chineseName: string;
  idcardNo: string;
  policeCode: string;
  deptCode: string;
  phoneNo: string;
  powerId: string;
  [key: string]: any;
}