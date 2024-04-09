export interface ITradeHistoryStates {
    activeKey:"Spot" | "Futures" | "Spread" | "Repo" |string,
    marketsType: string[],
    visible:boolean
    exportList:any
}

export interface ITradeSubTab {
    key: string,
    name:string
    component: React.ReactNode
}
export interface IIradeExportList {
    Spot: IIradeExport | {}
    Futures: IIradeExport | {}
    Spread: IIradeExport | {}
    Repo: IIradeExport | {}
}
export interface IIradeExport {
    initDate: string[]
    coin: any
    status?: string[]
    // type: "Spot" | "Futures" | "Spread" | "Repo"
}