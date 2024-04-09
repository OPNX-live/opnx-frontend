export interface ITradeHistoryStates {
  activeKey: 'Futures' | 'Index' | string;
  marketsType: string[];
  visible: boolean;
  exportList: any;
}

export interface ITradeSubTab {
  key: string;
  component: React.ReactNode;
  name:string
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
