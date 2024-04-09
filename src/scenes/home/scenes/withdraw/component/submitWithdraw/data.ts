import {intl} from "utils/Language";

export interface ISubmitWithdrawState {
  errorMessage: string;
  inputValue: string;
  amountValue: string;
  amountNot: boolean;
  addressNot: boolean;
  coinAddress: IAddress[];
  visable: boolean;
  update: boolean;
  withdrawRequestVisable: boolean;
  tfaModelVisable: boolean;
  tfaVerification: boolean;
  loading: boolean;
  fee: string | number;
  amountError: string;
  activeNetwork: string;
  willAmount: number | string;
  minWithdraw: string;
  memoValue: string;
  memoError: string;
  hasTwoPartAddress: boolean;
  maxWithdraw:string
  refash:boolean
  disableInput:boolean
}
export const SubmitState = {
  errorMessage: intl("address_error"),
  inputValue: "",
  amountNot: false,
  addressNot: false,
  amountValue: "",
  coinAddress: [],
  visable: false,
  update: false,
  withdrawRequestVisable: false,
  tfaModelVisable: false,
  tfaVerification: false,
  loading: false,
  fee: "",
  amountError: "",
  activeNetwork: "",
  willAmount: "--",
  minWithdraw: "--",
  memoValue: "",
  memoError: "",
  hasTwoPartAddress: false,
  maxWithdraw:"--",
  refash:false,
  disableInput:false
};
export interface ISubmitWithdrawProps {
  withdrawCoin: string;
  dashboardUserData: IDashboardUserData;
  withdrawBalance: IDepositBalance;
}
export interface IAddress {
  label: string;
  address: string;
  tag:string
  network:string
  isWhiteList:boolean
}
export interface IAddressType {
  address: string;
  instrumentId: string;
  isWhiteList:  boolean;
  lastUpdated: number;
  network: string;
  tag:  string;
  walletLabel: string;
}
