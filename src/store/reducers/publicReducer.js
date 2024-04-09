import { combineReducers } from "redux";
import publicState from "../state/publicState.js";

function users(state = publicState.users, action) {
  switch (action.type) {
    case "USERS":
      return action.data;
    default:
      return state;
  }
}
function provider(state = publicState.provider, action) {
  switch (action.type) {
    case "SET_PROVIDER":
      return action.data;
    default:
      return state;
  }
}
function isLogin(state = publicState.isLogin, action) {
  switch (action.type) {
    case "ISLOGIN":
      return action.data;
    default:
      return state;
  }
}

function competitions(state = publicState.competitions, action) {
  switch (action.type) {
    case "SET_ALL":
      return { ...state, all: action.data.competitions };
    case "SET_JOINABLE":
      return { ...state, joinable: action.data.competitions };
    case "SET_PAST":
      return { ...state, past: action.data.competitions };
    case "JOIN_COMPETITION":
      return { ...state, joined: [...state.joined, action.data] };
    case "LEAVE_COMPETITION":
      // const id =
      break;
    default:
      return state;
  }
}

function accoutListRefresh(state = publicState.accoutListRefresh, action) {
  switch (action.type) {
    case "ACCOUT_LIST":
      return action.data;
    default:
      return state;
  }
}

function subAccounts(state = publicState.subAccounts, action) {
  switch (action.type) {
    case "SUB_ACCOUNTS":
      return action.data;
    default:
      return state;
  }
}

function accountName(state = publicState.accountName, action) {
  switch (action.type) {
    case "ACCOUNT_NAME":
      return action.data;
    default:
      return state;
  }
}

function allLoginAccount(state = publicState.allLoginAccount, action) {
  switch (action.type) {
    case "ALL_LOGIN":
      return action.data;
    default:
      return state;
  }
}

function dimensions(state = publicState.dimensions, action) {
  switch (action.type) {
    case "RESIZE":
      return action.data;
    default:
      return state;
  }
}
function dashboardUserData(state = publicState.dashboardUserData, action) {
  switch (action.type) {
    case "DASHBOARDUSERDATA":
      return action.data;
    case "AGREE_MOONPAY":
      return { ...state, agreeMoonPay: action.data };
    default:
      return state;
  }
}
function wallet(state = publicState.isWallet, action) {
  switch (action.type) {
    case "WALLET":
      return action.data;
    default:
      return state;
  }
}
function depositCoin(state = publicState.depositCoin, action) {
  switch (action.type) {
    case "DEPOSIT_COIN":
      return action.data;
    default:
      return state;
  }
}

function withdrawCoin(state = publicState.withdrawCoin, action) {
  switch (action.type) {
    case "WITHDRAW_COIN":
      return action.data;
    default:
      return state;
  }
}
function refresh(state = publicState.refresh, action) {
  switch (action.type) {
    case "REFRESH":
      return action.data;
    default:
      return state;
  }
}
function SwitchLanguage(state = publicState.SwitchLanguage, action) {
  switch (action.type) {
    case "SWITCH_LANGUAGE":
      return action.data;
    default:
      return state;
  }
}

function loginActiveTab(state = publicState.loginActiveTab, action) {
  switch (action.type) {
    case "SWITCH_LOGIN_ACTIVE_TAB":
      return action.data;
    default:
      return state;
  }
}

function mateMaskSelectedAddress(
  state = publicState.mateMaskSelectedAddress,
  action
) {
  switch (action.type) {
    case "SET_METAMASK_SELECTED_ADDRESS":
      return action.data;
    default:
      return state;
  }
}

function ticker(state = publicState.ticker, action) {
  switch (action.type) {
    case "SET_TICKER_DATA":
      return action.data;
    default:
      return state;
  }
}

function tfaModalVisable(state = publicState.tfaModalVisable, action) {
  switch (action.type) {
    case "SET_TFA_MODL_VISABLE":
      return action.data;
    default:
      return state;
  }
}

function tfaList(state = publicState.tfaModalVisable, action) {
  switch (action.type) {
    case "TFA_LIST":
      return action.data;
    default:
      return state;
  }
}
function kycInfo(state = publicState.kycInfo, action) {
  switch (action.type) {
    case "KYC_INFO":
      return action.data;
    default:
      return state;
  }
}
//
export default combineReducers({
  accoutListRefresh,
  competitions,
  users,
  isLogin,
  subAccounts,
  accountName,
  allLoginAccount,
  dimensions,
  dashboardUserData,
  wallet,
  depositCoin,
  withdrawCoin,
  refresh,
  SwitchLanguage,
  provider,
  loginActiveTab,
  mateMaskSelectedAddress,
  ticker,
  tfaModalVisable,
  tfaList,
  kycInfo,
});
