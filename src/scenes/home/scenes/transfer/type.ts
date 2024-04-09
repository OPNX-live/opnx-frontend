export interface ITransferState {
  accountListResult: IAccountResult[];
  accountParams: ITransParams;
  loading: 0 | 1;
  coinList: ICoin[];
  allCoinList: string[];
  available: string;
  isCheck: boolean;
  accuracy: { [key: string]: string } | null;
}

export interface IAccountResult {
  accountId: string;
  accountName: string;
  accountStatus: string;
  isMainAccount: boolean;
  tradingType: string;
}

export interface ITransParams {
  fromAccountId: string;
  toAccountId: string;
  transferInstrument: string;
  transferAmount: string;
}

export interface ICoin {
  available: string;
  instrumentId: string;
}
