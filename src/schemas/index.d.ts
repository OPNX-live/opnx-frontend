type TDispatch = any;
type IAccoutList = {
  defaultStandard: boolean;
  accountName: string;
  accountStatus: string;
  accountType: string;
  createdDate: number;
  defaultAccount: boolean;
  isMainAccount: boolean;
  tradingType: string[];
  _key: string;
  defaultPortfolio:boolean
  estimatedAccountBalanceResp: {
    balance: string;
    marketValue: string;
    tradingType: string;
  };
};
interface IAllAccout {
  accounts: {
    accountId: string;
    accountName: string;
    tradingType: string;
    isMainAccount: boolean;
  };
}
interface ITabSubAccount {
  accountId: string;
  accountName: string;
  canDeposit: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  isValid: boolean;
  tradingType: string;
  isMainAccount: boolean;
}
interface IsLogin {
  isLogin: boolean;
}
interface Iusers {
  accountId: string;
  address?: string;
  email: string;
  token: string;
  accountName: string;
  mainLogin: boolean;
  loginId: string;
  accountId: string;
}
interface IGlobalT {
  allLoginAccount: IAllLoginAccount[];
  users: Iusers;
  isLogin: boolean;
  wallet: boolean;
  dashboardUserData: IDashboardUserData;
  subAccounts: IAllAccout[];
  SwitchLanguage: string;
  provider: any;
  loginActiveTab: string;
  tfaModalVisable: boolean;
  loginActiveTab: string;
  mateMaskSelectedAddress: string;
  tfaList?: string[];
  hideSmallBalance:boolean;
}
interface IAllLoginAccount {
  loginId: string;
  userName: string;
  loginUserStatus: string;
  loginKey: string;
  enableTfa: boolean;
  email: string;
  createdDate: string;
  accounts: IAccounts[];
}
interface IUserDataAccount {
  _id: ReactText;
  accountName: string;
  accountStatus: string;
}
interface IDashboardUserData extends Iusers {
  accountId: string;
  accountName: string;
  bindEmail: string;
  isMainAccount: boolean;
  agreeMoonPay: boolean;
  loginId: string;
  loginName: string;
  copperAccount?: string;
  bindEmail?: string;
  permission: {
    canTrade: boolean;
    canWithdraw: boolean;
  };
  tradingType: string;
  enableTfa: boolean;
  tfaProtected: ITfaProtected;
  tfaType: string;
  tradingFeeLevel: {
    flexBalance?: string;
    lastUpdated?: string;
    vipLevel: string;
    specialVipLevel: string;
    vipType: string;
  };
  kycInfo: {
    level: number;
    limitPerDay: string;
    name: string;
    nationality: string;
    country: string;
  };
  enableWithdrawalWhiteList?: boolean;
  accountSource: string;
  publicAddress: string;
  sourceType: string;
}
interface ITfaProtected {
  isLogin: boolean;
  isLoginAndManagement: boolean;
  isModifications: boolean;
  isWithdraw: boolean;
}
interface IAccounts {
  accountId: string;
  accountName: string;
  accountType: string;
  createdDate: string;
  canTrade: boolean;
  canWithdraw: boolean;
  defaultAccount: boolean;
  bindDate: string;
}
interface IBalanceDetails {
  name: string;
  values: number;
  quantity: number;
}
interface IBalanceDetailsData {
  datas: IBalanceDetails[];
  totals: {};
}

interface IDepositBalance {
  availableBalance: string;
  reserved: string;
  totalBalance: string;
}
interface IWithdrawBlance {
  availableBalance: string;
  reserved: string;
  totalBalance: string;
}
interface IDepositTableResponse {
  address: string;
  amount: number;
  createdDate: string;
  instrument: string;
  status: "PENDING" | "FAILED" | "COMPLETED";
  txId: string;
  txIdUrl: string;
  walletLabel: string;
  txUrl: string;
}
interface ITransferTableResponse {
  fromAccountId: string;
  toAccountId: string;
  transferType: string;
  amount: number;
  instrument: string;
  transTimestamp: string;
  status: "PENDING" | "FAILED" | "COMPLETED" | string;
  fromAccountName: string;
  toAccountName: string;
  reference?: string;
  tradingType: string;
  fromTradingType: string;
  toTradingType: string;
}

interface IParams {
  pageNum: number;
  pageSize: number;
}
interface WebSocketMessageEvent {
  data: string;
}
interface Message {
  data: any[];
}
interface SendMessageEvent {
  op: string;
  data: any;
}
type TIntllist = "English" | "中文";
interface ISignatureVerification {
  publicAddress: string;
  signature: string;
}

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
declare global {
  interface Window {
    _Sardine: any;
  }
}
