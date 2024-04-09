export interface IWithdrawState {
  coinData: {code:string,name:string}[];
  coin: string;
  showPosition: boolean;
  wfaModelVisable: boolean;
  withdrawFee: IwithdrawFee;
  withdrawLimit:{
    "end": number, // withdrawalAmount 统计结束时间
    "limit": string, //  withdrawal 能提数量
    "noLimit": boolean, //  false withdrawal 数量有限制， true withdrawal 数量无限制
    "start": number, // withdrawalAmount 统计开始时间
    "withdrawalAmount": string // withdrawal 已提数量
  },
  switchVisable:boolean,
  withdrawBalance:IWithdrawBlance
  coinNetwork:{
    netWorks:{network:string,txId:string}[]
    coinIso:string
    hasTwoPartAddress:boolean
  }[]
  coinAccuracy:{[key:string]:string}
  warningUsd:boolean,
}
interface IwithdrawFee {
  fee: string;
  minimum: string;
}
export const withdrawStatus:IWithdrawState = {
  coinData: [],
  coin: "USDT",
  showPosition: false,
  wfaModelVisable: false,
  withdrawFee: {
    fee: "0",
    minimum: "0",
  },
  withdrawLimit:{
    "end": 0,
    "limit": "0", 
    "noLimit": false,
    "start": 0, 
    "withdrawalAmount": "0" 
  },
  switchVisable:false,
  withdrawBalance:{
    availableBalance: "--",
    reserved: "--",
    totalBalance: "--",
  },
  coinNetwork:[],
  coinAccuracy:{},
  warningUsd:false,
};
export interface IWithdrawProps {
  withdrawCoin: string;
  withdrawBalance: IDepositBalance;
  dashboardUserData: IDashboardUserData;
  refresh: boolean;
  users:Iusers
}
export interface Inetwork{
 isWithdrawal: boolean|null;netWorks:{network:string}[]
}