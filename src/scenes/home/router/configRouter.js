import loadable from "@loadable/component";
import FlexAssetHistory from "../scenes/flexAssetHistory/FlexAssetHistory";

export const FlexAssetHistoryReward = loadable(() =>
  import("../scenes/flexAssetHistoryReward/FlexAssetHistoryReward")
);

export const LoginManagement = loadable(() =>
  import("scenes/home/scenes/loginManagement/loginManagement")
);
export const SubAccout = loadable(() =>
  import("scenes/home/scenes/subaccout/subaccout")
);
export const ApiManagement = loadable(() =>
  import("scenes/home/scenes/apiManagement/apimanagement")
);
export const Dashboard = loadable(() =>
  import("scenes/home/scenes/dashboard/dashboard")
);
export const Securitycomponent = loadable(() =>
  import("scenes/home/scenes/securtity/securtitycomponent")
);
export const GoogleTwoFa = loadable(() =>
  import("scenes/home/scenes/securtity/components/googleTwoFa/googletwofa")
);
export const AuthyTwoFa = loadable(() =>
  import("scenes/home/scenes/securtity/components/authyTwoFa/authytwofa")
);
export const YoubikeyTwoFa = loadable(() =>
  import("scenes/home/scenes/securtity/components/youbikeyTwoFa/youbikeytwofa")
);
export const Balance = loadable(() =>
  import("scenes/home/scenes/Balance/balance")
);
export const Position = loadable(() =>
  import("scenes/home/scenes/position/position")
);
// export const Deposit = loadable(() =>
//   import("scenes/home/scenes/deposit/index")
// );
export const Transfer = loadable(() =>
  import("scenes/home/scenes/transfer/transfer")
);

export const History = loadable(() =>
  import("scenes/home/scenes/history/history")
);
export const Withdraw = loadable(() =>
  import("scenes/home/scenes/withdraw/withdraw")
);
export const AddressManagement = loadable(() =>
  import(
    "scenes/home/scenes/securtity/components/addressManagement/addressmanagement"
  )
);
export const TradeHistory = loadable(() =>
  import("scenes/home/scenes/tradeHistory/TradeHistory")
);
export const SettlementHistory = loadable(() =>
  import("scenes/home/scenes/settlementHistory/settlementHistory")
);

export const FlexAssets = loadable(() =>
  import("scenes/home/scenes/flexAssetsBorrow/flexAssetsBorrow")
);
// export const KYCNew = loadable(()=> import ("scenes/home/scenes/KYCNew/KYC"))

export const KYCOne = loadable(() =>
  import("scenes/home/scenes/KYCOne/KYCOne")
);
export const KYC = loadable(() => import("scenes/home/scenes/KYC/KYC"));
export const AntiPhishing = loadable(() =>
  import("scenes/home/scenes/AntiPhishing/AntiPhishing")
);
export const pairEmail = loadable(() =>
  import("scenes/home/scenes/pairEmail/pairEmail")
);
export const RewardCenter = loadable(() =>
  import("scenes/home/scenes/RewardCenter/RewardCenter")
);
export const ConvertSmall = loadable(() =>
  import("scenes/home/scenes/ConvertSmall/ConvertSmall")
);
export const AmmHistory = loadable(() =>
  import("scenes/home/scenes/AmmHistory/AmmHistory")
);
export const TermService = loadable(() =>
  import("scenes/TermService/TermService")
);
export const ReferralFeatures = loadable(() =>
  import("scenes/referra-features/referralFeatures")
);
export const OUSDHistory = loadable(() =>
  import("scenes/home/scenes/oUSDHistory/oUSDHistory")
);

export const HomeRouterComponents = [
  {
    name: "Dashboard",
    component: Dashboard,
    exact: true,
    path: "/home",
    isLogin: true,
  },
  {
    name: "Login Management",
    component: LoginManagement,
    exact: true,
    path: "/home/loginManagement",
    isLogin: true,
  },
  {
    name: "Sub Accounts",
    component: SubAccout,
    exact: true,
    path: "/home/subAccount",
    isLogin: true,
  },
  {
    name: "API Management",
    component: ApiManagement,
    exact: true,
    path: "/home/apiManagement",
    isLogin: true,
  },
  {
    name: "Security",
    component: Securitycomponent,
    exact: true,
    path: "/home/security",
    isLogin: true,
  },
  // {
  //   name: "Referral",
  //   component: ReferralFeatures,
  //   exact: true,
  //   path: "/home/referral",
  //   isLogin: false,
  // },
  {
    name: "Google 2FA",
    component: GoogleTwoFa,
    exact: true,
    path: "/home/security/google_2fa",
    isLogin: true,
  },
  {
    name: "Authy 2FA",
    component: AuthyTwoFa,
    exact: true,
    path: "/home/security/authy_2fa",
    isLogin: true,
  },
  {
    name: "YubiKey 2FA",
    component: YoubikeyTwoFa,
    exact: true,
    path: "/home/security/yubikey_2fa",
    isLogin: true,
  },
  {
    name: "Balance",
    component: Balance,
    exact: true,
    path: "/home/walletManagement/balance",
    isLogin: true,
  },
  {
    name: "Position",
    component: Position,
    exact: true,
    path: "/home/walletManagement/position",
    isLogin: true,
  },
  // {
  //   name: "Deposit",
  //   component: Deposit,
  //   // exact: true,
  //   path: "/home/walletManagement/deposit",
  //   // isLogin: true,
  // },
  {
    name: "Transfer",
    component: Transfer,
    exact: true,
    path: "/home/walletManagement/transfer",
    isLogin: true,
  },
  {
    name: "History",
    component: History,
    // exact: true,
    path: "/home/walletManagement/history",
    // isLogin: true,
  },
  {
    name: "Withdraw",
    component: Withdraw,
    // exact: true,
    path: "/home/walletManagement/withdraw",
    // isLogin: true,
  },
  {
    name: "Address Management",
    component: AddressManagement,
    exact: true,
    path: "/home/security/addressManagement",
    isLogin: true,
  },
  {
    name: "Trade History",
    component: TradeHistory,
    exact: true,
    path: "/home/walletManagement/TradeHistory",
    isLogin: true,
  },
  {
    name: "FlexAssetHistory",
    component: FlexAssetHistory,
    exact: true,
    path: "/home/walletManagement/lendingHistory",
    isLogin: true,
  },
  // {
  //   name: "FlexAssetHistoryReward",
  //   component: FlexAssetHistoryReward,
  //   exact: true,
  //   path: "/home/flexAsset/flexAssetHistoryReward",
  //   isLogin: true
  // },

  {
    name: "FlexAssets",
    component: FlexAssets,
    exact: true,
    path: "/home/walletManagement/collateralHistory",
    isLogin: true,
  },
  // {
  //   name: "Settlement History",
  //   component: SettlementHistory,
  //   exact: true,
  //   path: "/home/walletManagement/SettlementHistory",
  //   isLogin: true,
  // },
  // {
  //     name: "KYC",
  //     component: KYCOne,
  //     exact: true,
  //     path: "/home/KYC",
  //     isLogin: true
  // },
  // {
  //   name: "KYC",
  //   component: KYC,
  //   exact: true,
  //   path: "/home/KYC",
  //   isLogin: true,
  // },
  {
    name: "Anti-Phishing",
    component: AntiPhishing,
    exact: true,
    path: "/home/security/AntiPhishing",
    isLogin: true,
  },
  {
    name: "pairEmail",
    component: pairEmail,
    exact: true,
    path: "/home/pairEmail",
    isLogin: true,
  },
  {
    name: "Convert Small OPNX to FLEX",
    component: ConvertSmall,
    exact: true,
    path: "/home/walletManagement/balance/ConvertSmall",
    isLogin: true,
  },
  {
    name: "AMM History",
    component: AmmHistory,
    exact: true,
    path: "/home/ammHistory/history",
    isLogin: true,
  },
  {
    name: "oUSD Vault History",
    component: OUSDHistory,
    exact: true,
    path: "/home/walletManagement/oUSDHistory",
    isLogin: true,
  },

  // {
  //   name: "Reward Center",
  //   component: RewardCenter,
  //   exact: true,
  //   path: "/home/rewardCenter",
  //   isLogin: true
  // },
  // {
  //   name: "Reward Center",
  //   component: RewardCenter,
  //   exact: true,
  //   path: "/home/rewardCenter",
  //   isLogin: true
  // }
];
