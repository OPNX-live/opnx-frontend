export const DepositState = {
  coinData: [],
  coin:"",
  coinAddress:"",
  legacyAddress:"",
  depositBalance:{
    availableBalance: "--",
    reserved: "--",
    totalBalance: "--",
  },
  memoTag:"",
  metamaskAddress:""
};
export interface IDepositState {
  coinData: {code:string,name:string}[];
  coin:string;
  coinAddress:string;
  legacyAddress:string|null,
  depositBalance:IDepositBalance
  memoTag:string
  metamaskAddress:string
}
export interface IDepositBalance{
  availableBalance:string,
  reserved:string,
  totalBalance:string
}
export interface IDepositProps{
  dashboardUserData: IDashboardUserData;
  depositCoin:string;
  depositBalance:IDepositBalance
}
export enum EnumTradingType {
  "LINEAR" = "Linear-USD",
  "INVERSE_ETH"="Inverse_ETH",
  "INVERSE_BTC"="Inverse_BTC",
}
