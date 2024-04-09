import edit from "../../../../assets/image/edit.svg";
import trashCan from "../../../../assets/image/trashCan.svg";
import addUser from "../../../../assets/image/addUser.png";
import assetsBottom from "../../../../assets/image/assetsBottom.png";
import empty from "../../../../assets/image/empty-table.png";
import assetsTop from "../../../../assets/image/assetsTop.png";
import prev from "../../../../assets/image/pagination-left.svg";
import next from "../../../../assets/image/pagination-right.svg";

export const imgList = {
  edit,
  trashCan,
  addUser,
  assetsBottom,
  empty,
  assetsTop,
  prev,
  next,
};
export enum EnumAccountStatus {
  "Active" = "ACTIVE",
  "Freeze" = "FREEZE",
  "Locked" = "LOCKED",
  "Withdraw Banned" = "WITHDRAWAL_BANNED",
  "Trade Banned" = "TRADE_BANNED",
  "Read-Only" = "READ_ONLY",
  "Inactive" = "INACTIVE",
}
export enum AccountStatusColor {
  "Active" = "#52C41A",
  "Inactive" = "#1890FF",
  "Freeze" = "#F76260",
  "Locked" = "#FF4D4F",
  "Withdrawal Banned" = "#FAAD14",
  "Trade Banned" = "#FAAD14",
  "Read-Only" = "#FAAD14",
}
export function status(status: any) {
  if (status === "TRADING") {
    return "Trading";
  } else if (status === "ACTIVE") {
    return "Active";
  } else if (status === "FREEZE") {
    return "Freeze";
  } else if (status === "INVERSE_BTC") {
    return "Inverse-BTC";
  } else if (status === "INVERSE_ETH") {
    return "Inverse-ETH";
  } else if (status === "LINEAR") {
    return "Linear-USD";
  } else if (status === "TRADE_BANNED") {
    return "Trade Banned";
  } else if (status === "WITHDRAWAL_BANNED") {
    return "Withdraw Banned";
  } else if (status === "LOCKED") {
    return "Locked";
  } else if (status === "READ_ONLY") {
    return "Read-Only";
  } else if(status==="BORROW"){
    return "Borrow";
  }else{
    return status;
  }
}
