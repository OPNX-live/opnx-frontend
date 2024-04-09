export interface IAddressManagementStates {
  params: IAddressManagementParams;
  result: IAddressManagementResult[];
  data: IAddressManagementResult[];
  initResult: IAddressManagementResult[];
  deleteList: string[];
  visable: boolean;
  loading: 1 | 0;
  btnLoading: boolean;
  isVisable: boolean;
  deleteStr: string;
  tfaVisable: boolean;
  whiteListVisible: boolean;
  whiteListType:
    | 'OpenWhiteList'
    | 'EnableWhiteList'
    | 'CloseWhiteList'
    | 'DeleteWhiteList';
  tfaOpenisible: boolean;
  tfaType: 'add' | null;
  selectRow: any;
  selectDels: any;
  isDelAll: boolean;
}

export interface IAddressManagementResult {
  id: string;
  address: string;
  instrumentId: string;
  lastUpdated: number;
  walletLabel: string;
  isWhiteList: boolean;
  network: string;
  tag: string;
}

export interface IAddressManagementParams {
  pageNum: number;
  pageSize: number;
  searchParams: string;
  isSearchWhiteList: boolean;
}
