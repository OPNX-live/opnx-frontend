import edit from "../../../../assets/image/edit.svg";
import trashCan from "../../../../assets/image/trashCan.svg";
import addUser from "../../../../assets/image/addUser.svg";
import assetsBottom from "../../../../assets/image/assetsBottom.png";
import empty from "../../../../assets/image/empty-table.png";
import assetsTop from "../../../../assets/image/assetsTop.png";
import prev from "../../../../assets/image/pagination-left.svg";
import next from "../../../../assets/image/pagination-right.svg";
import yincang_play from "../../../../assets/image/yincang_play.svg";
import yincang from "../../../../assets/image/yincang.svg";
import React from "react";

export const imgList = {
  edit,
  trashCan,
  addUser,
  assetsBottom,
  empty,
  assetsTop,
  prev,
  next,
  yincang_play,
  yincang,
};
export function status(status) {
  if (status === "TRADING") {
    return <span>Trading</span>;
  } else if (status === "ACTIVE") {
    return <span>ACTIVE</span>;
  } else if (status === "FREEZE") {
    return <span>Freeze</span>;
  } else if (status === "INVERSE_BTC") {
    return <span>Inverse-BTC</span>;
  } else if (status === "INVERSE_ETH") {
    return <span>Inverse-ETH</span>;
  } else if (status === "LINEAR") {
    return <span>Linear-USD</span>;
  } else {
    return status;
  }
}
export const vipLever = (vipType, vipLevel, specialVipLevel) => {
  console.log(vipType, vipLevel, specialVipLevel);
  if (vipType === "manual") {
    return Number(vipLevel) > Number(specialVipLevel)
      ? vipLevel
      : specialVipLevel;
  } else {
    return vipLevel ? vipLevel : specialVipLevel;
  }
};
