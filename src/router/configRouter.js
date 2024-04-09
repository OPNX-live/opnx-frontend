import loadable from "@loadable/component";
export const Home = loadable(() => import("scenes/home/home"));
export const Verification = loadable(() => import("scenes/mailVerification"));
// export const Register = loadable(() => import("scenes/register/register"));
// export const Login = loadable(() => import("scenes/login/login"));
export const ForgetPassword = loadable(() =>
  import("scenes/login/components/forgetPassword/forgetpassword")
);
export const ErrorVerfiy = loadable(() => import("scenes/errorVerfiy"));
export const ResetPassword = loadable(() =>
  import("scenes/login/components/resetPassword/resetpassword")
);
export const verifyAccount = loadable(() =>
  import("scenes/verifyAccount/verifyaccount")
);
// export const FeeSchedule = loadable(() => import("scenes/feeSchedule"));
export const ServerError = loadable(() => import("scenes/500/500"));
export const FundingHistory = loadable(() =>
  import("scenes/fundingHistory/FundingHistory")
);
export const TfaLoginValidation = loadable(() =>
  import("scenes/login/components/tfaValidation")
);

export const referral = loadable(() => import("scenes/referral/referral"));

// export const ReferralFeatures = loadable(() =>
//   import("scenes/referra-features/referralFeatures")
// );
export const Vote = loadable(() => import("scenes/Vote/Vote"));
// export const ProfitLossAnalysis = loadable(() =>
//   import("scenes/ProfitLossAnalysis/ProfitLossAnalysis")
// );

export const MetamaskBind = loadable(() =>
  import("scenes/metaMask/metaMaskBind/MetaMaskBind")
);

export const Moonpay = loadable(() =>
  import("scenes/home/scenes/Moonpay/moonpay")
);
export const TermService = loadable(() =>
  import("scenes/TermService/TermService")
);
export const RouterComponents = [
  {
    name: "Home",
    component: Home,
    exact: false,
    path: "/home",
    isLogin: false,
  },
  {
    name: "Verification",
    component: Verification,
    exact: true,
    path: "/verification",
    isLogin: false,
  },
  {
    name: "ErrorVerfiy",
    component: ErrorVerfiy,
    exact: true,
    path: "/ErrorVerfiy",
    isLogin: false,
  },
  // {
  //   name: "Register",
  //   component: Register,
  //   exact: true,
  //   path: "/register",
  //   isLogin: false
  // },
  // {
  //   name: "Login",
  //   component: Login,
  //   exact: true,
  //   path: "/login",
  //   isLogin: false
  // },
  {
    name: "Reset Password",
    component: ForgetPassword,
    exact: true,
    path: "/forgetpassword",
    isLogin: false,
  },
  {
    name: "ResetPassword",
    component: ResetPassword,
    exact: true,
    path: "/resetpassword",
    isLogin: false,
  },
  {
    name: "verifyAccount",
    component: verifyAccount,
    exact: true,
    path: "/verifyAccount",
    isLogin: false,
  },
  // {
  //   name: "FeeSchedule",
  //   component: FeeSchedule,
  //   exact: true,
  //   path: "/feeSchedule",
  //   isLogin: false,
  // },
  {
    name: "ServerError",
    component: ServerError,
    exact: true,
    path: "/500",
    isLogin: false,
  },
  {
    name: "ServerError",
    component: ServerError,
    exact: true,
    path: "/500",
    isLogin: false,
  },
  {
    name: "FundingHistory",
    component: FundingHistory,
    exact: false,
    path: "/fundingHistory",
    isLogin: false,
  },
  {
    name: "TfaLoginValidation",
    component: TfaLoginValidation,
    exact: true,
    path: "/loginTfa",
    isLogin: false,
  },

  {
    name: "Referral",
    component: referral,
    exact: true,
    path: "/referral",
    isLogin: false,
  },
  // {
  //   name: "ReferralFeatures",
  //   component: ReferralFeatures,
  //   exact: true,
  //   path: "/referralFeatures",
  //   isLogin: false,
  // },
  {
    name: "Vote",
    component: Vote,
    exact: true,
    path: "/Vote",
    isLogin: false,
  },
  // {
  //   name: "ProfitLossAnalysis",
  //   component: ProfitLossAnalysis,
  //   exact: true,
  //   path: "/profitLossAnalysis",
  //   isLogin: false,
  // },
  {
    name: "metamask",
    component: MetamaskBind,
    exact: true,
    path: "/metamask",
    isLogin: false,
  },
  {
    name: "Moonpay",
    component: Moonpay,
    exact: true,
    path: "/moonpay",
    isLogin: false,
  },
  {
    name: "Terms Service",
    component: TermService,
    exact: true,
    path: "/term-service",
    isLogin: true,
  },
];
