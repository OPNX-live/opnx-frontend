import React from "react";
import { FormattedMessage } from "react-intl";
import Dashboard from "assets/image/Dashboard.svg";
import DashboardActive from "assets/image/Dashboard-active.svg";
import Security from "assets/image/Securtity.svg";
import SecurityActive from "assets/image/Securtity-active.svg";
import KYC from "assets/image/Kyc.svg";
import KYCActive from "assets/image/Kyc-active.svg";

import Affiliate from "assets/image/Affiliate.svg";
import AffiliateActive from "assets/image/Affiliate-active.svg";

import Advanced from "assets/image/Advanced-active.svg";
import AdvancedActive from "assets/image/Advanced.svg";
import down from "assets/image/down.png";
import up from "assets/image/up.png";
import Settings from "assets/image/setting.svg";
import SettingsActive from "assets/image/setting-active.svg";
import WalletActive from "assets/image/Wallet management.png";
import Wallet from "assets/image/WalletManagementActive.png";
import Position from "assets/image/position.png";
import PositionActive from "assets/image/position_active.png";
import TradeHistory from "assets/image/TradeHistory.png";
import TradeHistoryActive from "assets/image/TradeHistoryActive.png";
import FLEXAsset from "assets/image/FLEXAssetActive.png";
import FLEXAssetActive from "assets/image/FLEXAsset.png";
import OrderActive from "assets/image/Order.png";
import Order from "assets/image/OrderActive.png";
import RewardCenter from "assets/image/RewardCenter.svg";
import RewardCenterActive from "assets/image/RewardCenterActive.svg";
import AMMHistoryActive from "assets/image/amm-history.png";
import AMMHistory from "assets/image/amm-history-active.png";
import AddressLinking from "assets/image/Addresslinking.svg";
import AddressLinkingActive from "assets/image/Addresslinking.svg";
import oUSDHistory from "assets/image/oUSDHistory.svg";
import oUSDHistoryActive from "assets/image/oUSDHistoryActive.svg";
import Rewards from "assets/image/FMT.svg";
import RewardsActive from "assets/image/FMTActive.svg";

export const imageList = {
  Dashboard,
  DashboardActive,
  Security,
  SecurityActive,
  KYC,
  KYCActive,
  Affiliate,
  AffiliateActive,
  Advanced,
  AdvancedActive,
  down,
  up,
  Settings,
  SettingsActive,
  Wallet,
  WalletActive,
  Position,
  PositionActive,
  TradeHistory,
  TradeHistoryActive,
  FLEXAsset,
  FLEXAssetActive,
  Order,
  OrderActive,
  RewardCenter,
  RewardCenterActive,
  AMMHistoryActive,
  AMMHistory,
  AddressLinking,
  AddressLinkingActive,
  oUSDHistory,
  oUSDHistoryActive,
  Rewards,
  RewardsActive
};
export const IsPC = () => {
  var userAgentInfo = navigator.userAgent;
  var Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod",
  ];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
};

export const tabRouter = [
  {
    key: "/home",
    title: "Dashboard",
    name: <FormattedMessage id="Dashboard" defaultMessage="Dashboard" />,
    children: false,
    isMoblie: true,
  },
  {
    key: "/home/security",
    title: "Security",
    name: <FormattedMessage id="Security" defaultMessage="Security" />,
    children: false,
    isMoblie: true,
    childrenRouterPath: [
      {
        path: "/home/security/authy_2fa",
      },
      {
        path: "/home/security/google_2fa",
      },
      {
        path: "/home/security/yubikey_2fa",
      },
      {
        path: "/home/security/addressManagement",
      },
      {
        path: "/home/security/AntiPhishing",
      },
    ],
  },
  {
    key: "/home/KYC",
    name: <FormattedMessage id="KYC" defaultMessage="Advanced" />,
    title: "KYC",
    link: "account/kyc",
    children: false,
  },
  {
    key: "/home/referral",
    name: "Affiliate",
    title: "Affiliate",
    link: "/referral",
    isMoblie: true,
    children: false,
  },

  {
    key: "/home/advanced",
    title: "Advanced",
    name: <FormattedMessage id="Advanced" defaultMessage="Advanced" />,
    children: true,
    content: [
      {
        key: "/home/subAccount",
        title: "Sub-account",
        name: "Sub Accounts",
        isMoblie: true,
      },
      {
        key: "/home/loginManagement",
        title: "Login Management",
        name: (
          <FormattedMessage
            id="Login_Management"
            defaultMessage="Login Management"
          />
        ),
      },
      {
        key: "/home/apiManagement",
        title: "API Management",
        name: (
          <FormattedMessage
            id="API_Management"
            defaultMessage="API Management"
          />
        ),
      },
    ],
  },
  {
    key: "/home/AddressLinking",
    name: (
      <FormattedMessage id="pairAccount" defaultMessage="Address Linking" />
    ),
    title: "Address Linking",
    link: "account/address-linking",
    children: false,
  },
  {
    key: "/home/rewards",
    name: (
      <FormattedMessage id="rewards" defaultMessage="Rewards" />
    ),
    title: "Rewards",
    link: "rewards/fmt",
    children: false,
  },
];
export const tabWalletRouter = [
  {
    key: "/home/walletManagement",
    name: <FormattedMessage id="WalletHistory" defaultMessage="Wallet" />,
    title: "Wallet",
    children: true,
    content: [
      {
        key: "/home/walletManagement/balance",
        title: "Balance",
        isMoblie: true,
        name: <FormattedMessage id="Balance" defaultMessage="Balance" />,
        childrenRouterPath: [
          { path: "/home/walletManagement/balance/ConvertSmall" },
        ],
      },
      // {
      //   key: "/home/walletManagement/deposit",
      //   title: "Deposit",
      //   isMoblie: true,
      //   name: <FormattedMessage id="Deposit" defaultMessage="Deposit" />,
      // },
      {
        key: "/home/walletManagement/withdraw",
        title: "Withdraw",
        isMoblie: true,
        name: <FormattedMessage id="Withdraw" defaultMessage="Withdraw" />,
      },
      {
        key: "/home/walletManagement/transfer",
        title: "Transfer",
        name: <FormattedMessage id="Transfer" defaultMessage="Transfer" />,
      },
      {
        key: "/home/walletManagement/history",
        title: "History",
        name: <FormattedMessage id="History" defaultMessage="History" />,
      },
    ],
  },
  {
    key: "/home/order",
    name: <FormattedMessage id="Order" defaultMessage="Order" />,
    title: "Order",
    children: true,
    content: [
      {
        key: "/home/walletManagement/position",
        title: "Position",
        name: <FormattedMessage id="Position" defaultMessage="Position" />,
        children: false,
      },
      {
        key: "/home/walletManagement/TradeHistory",
        title: "Trade History",
        name: (
          <FormattedMessage id="Trade_History" defaultMessage="Trade History" />
        ),
        children: false,
      },
      // {
      //   key: "/home/walletManagement/SettlementHistory",
      //   title: "Settlement History",
      //   name: (
      //     <FormattedMessage
      //       id="SettlementHistory"
      //       defaultMessage="Settlement History"
      //     />
      //   ),
      //   children: false,
      // },
    ],
  },
  {
    key: "/home/flexAsset",
    title: "FLEXAsset",
    name: "Borrow & lend",
    children: true,
    content: [
      {
        key: "/home/walletManagement/lendingHistory",
        title: "Mint",
        name: (
          <FormattedMessage id="Lend & Redeem" defaultMessage="Lend & Redeem" />
        ),
      },
      {
        key: "/home/walletManagement/collateralHistory",
        title: "Borrow",
        name: (
          <FormattedMessage
            id="Borrow & Repay"
            defaultMessage="Borrow & Repay"
          />
        ),
      },
    ],
  },
  // {
  //   key: "/home/rewardCenter",
  //   ),
  //   children: false
  // }
  {
    key: "/home/ammHistory",
    title: "AMM History",
    name: "AMM History",
    children: true,
    content: [
      {
        key: "/home/ammHistory/history",
        title: "History",
        name: <FormattedMessage id="History" defaultMessage="History" />,
      },
    ],
  },

  {
    key: "/home/walletManagement/oUSDHistory",
    title: "oUSD History",
    name: "oUSD History",
    children: false,
  },
  // {
  //   key: "/home/rewardCenter",
  //   title: "Reward Center",
  //   name: (
  //     <FormattedMessage id="Reward Center" defaultMessage="Reward Center" />
  //   ),
  //   children: false,
  // },
];
export const temporaryOff = (key) => {
  if (process.env.REACT_APP_TEMPORARY_OFF) {
    return "";
  } else {
    return (
      key === "/home/walletManagement/deposit" ||
      key === "/home/walletManagement/withdraw"
    );
  }
};
export const exactPath = (route, type) => {
  let path = window.location.pathname;
  let pathname = [
    process.env.REACT_APP_ROUTER + "/home",
    process.env.REACT_APP_ROUTER + "/home",
  ];

  route.forEach((item) => {
    if (item.children) {
      item.content.forEach((child) => {
        if (path === process.env.REACT_APP_ROUTER + child.key) {
          pathname = [
            process.env.REACT_APP_ROUTER + item.key,
            process.env.REACT_APP_ROUTER + child.key,
          ];
          return;
        } else if (child.childrenRouterPath) {
          child.childrenRouterPath.forEach((i) => {
            if (path === process.env.REACT_APP_ROUTER + i.path) {
              pathname = [
                process.env.REACT_APP_ROUTER + item.key,
                process.env.REACT_APP_ROUTER + child.key,
              ];
            }
          });
        }
      });
    }
    if (item.childrenRouterPath) {
      item.childrenRouterPath.forEach((r) => {
        if (process.env.REACT_APP_ROUTER + r.path === path) {
          pathname = [
            process.env.REACT_APP_ROUTER + r.path,
            process.env.REACT_APP_ROUTER + item.key,
          ];
        } else if (process.env.REACT_APP_ROUTER + item.key === path) {
          pathname = [
            process.env.REACT_APP_ROUTER + item.key,
            process.env.REACT_APP_ROUTER + item.key,
          ];
        }
        return;
      });
    } else if (path === process.env.REACT_APP_ROUTER + item.key) {
      pathname = [
        process.env.REACT_APP_ROUTER + item.key,
        process.env.REACT_APP_ROUTER + item.key,
      ];
      return;
    } else {
      return;
    }
  });
  return pathname;
};
export const mobileFilter = (routeList, isMobile) => {
  if (isMobile) {
    const r = [];
    routeList.forEach((route) => {
      if (route.children) {
        const childRoute = route.content.filter((child) => child.isMoblie);
        if (childRoute.length) {
          r.push({ ...route, content: childRoute });
        }
      }
      if (route.isMoblie) {
        r.push(route);
      }
    });
    return r;
  }
  return routeList;
};
