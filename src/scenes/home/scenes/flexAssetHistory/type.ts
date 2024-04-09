export interface IFlexAssetHistoryStates {
  activeKey: "Mint" | "Redeem" | "Borrow" | "Reward" | string;
  marketsType: string[];
  visible: boolean;
  exportList: any;
  initDate: any;
}

export interface ITradeSubTab {
  key: string;
  component: React.ReactNode;
}
export interface IIradeExportList {
  Spot: IIradeExport | {};
  Futures: IIradeExport | {};
  Spread: IIradeExport | {};
  Repo: IIradeExport | {};
}
export interface IIradeExport {
  initDate: string[];
  coin: any;
  status?: string[];
  // type: "Spot" | "Futures" | "Spread" | "Repo"
}
