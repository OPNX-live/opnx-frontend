import success from "../../../../../../assets/image/success.png";
import copyAddress from "../../../../../../assets/image/copyAddress.png";
import code from "../../../../../../assets/image/code.png";
import codeHover from "../../../../../../assets/image/codeHover.png";
import copyHover from "../../../../../../assets/image/copyHover.svg";
import waring from "../../../../../../assets/image/waring.png";
import refresh from "../../../../../../assets/image/refresh.png";
export { success, copyAddress, code, codeHover, copyHover, waring, refresh };
export interface IDepositAddressState {
  copyHover: boolean;
  copySuccess: boolean;
  switchBtn: boolean;
  coinNetwork: {
    netWorks: { network: string; txId: string }[];
    coinIso: string;
  }[];
  activeNetwork: string;
  memoSuccess: boolean;
  miniDeposit: string;
}
export const DepositAddressState = {
  copyHover: false,
  copySuccess: false,
  switchBtn: true,
  coinNetwork: [],
  activeNetwork: "",
  memoSuccess: false,
  miniDeposit: ""
};
export enum EnumCoin {
  "BTC" = "BTC",
  "BCH" = "BCH",
  "ETH" = "ETH",
  "USD" = "ERC20",
  "FLEX" = "BCH-SLP",
  "LTC" = "LTC",
  "XRP" = "XRP",
  "EOS" = "EOS",
  "USDT" = "ERC20",
  "TRX" = "TRX",
  "LINK" = "ERC20"
}
export interface IDepositAddressProps {
  depositCoin: string;
  dashboardUserData: IDashboardUserData;
}
export interface INetwork {
  isWithdrawal: boolean | null;
  netWorks: { network: string }[];
}
