import { Dispatch } from "redux";
import { allAccounts, getKycResult, getTypeList } from "service/http/http";
import { sendMessage } from "service/webScoket/config";
import { localStorage } from "utils";
export const setUser =
  (
    data: Iusers = {
      email: "",
      token: "",
      accountName: "",
      mainLogin: false,
      loginId: "",
      accountId: "",
    },
    type?: string
  ) =>
  (dispatch: Dispatch) => {
    if (type !== "storage") {
      // 如果是子账户切换
      localStorage.set("user", data);
    } else {
    }
    if (data) {
      sendMessage.close(); // 切换子账户，重新建立链接
    }
    dispatch({ type: "USERS", data });
    return Promise.resolve(true);
  };
export function setIsLogin(data: boolean) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "ISLOGIN", data });
  };
}
export function setAccoutList(data: boolean) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "ACCOUT_LIST", data });
  };
}
export function setAllLogin(data: IAllLoginAccount[]) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "ALL_LOGIN", data });
  };
}
export function setSubAccouts() {
  return (dispatch: Dispatch) => {
    allAccounts().then((res) => {
      if (res) {
        const data = typeof res === "object" ? res.data?.accounts : [];
        dispatch({ type: "SUB_ACCOUNTS", data });
      }
    });
  };
}

export function setAccountName(data: string) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "ACCOUNT_NAME", data });
  };
}
export function setProvider(prvdr: any) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "SET_PROVIDER", data: prvdr });
  };
}
export function setDimensions(data: object) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "RESIZE", data });
  };
}
export function setDashboardUserData(data: IDashboardUserData) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "DASHBOARDUSERDATA", data });
  };
}
export function setWallet(data: boolean) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "WALLET", data });
  };
}
export function setDepositCoin(data: string) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "DEPOSIT_COIN", data });
  };
}
export function setWihdrawCoin(data: string) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "WITHDRAW_COIN", data });
  };
}
export function setRefresh(data: boolean) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "REFRESH", data });
  };
}
export function setSwitchLanguage(data: string) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "SWITCH_LANGUAGE", data });
  };
}

export function switchLoginActiveTab(data: string) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "SWITCH_LOGIN_ACTIVE_TAB", data });
  };
}

export function setMateMaskAddress(data: any) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "SET_METAMASK_SELECTED_ADDRESS", data });
  };
}

export function setTicker(data: any) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "SET_TICKER_DATA", data });
  };
}

export function setTfaModalVisable(visable: boolean) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "SET_TICKER_DATA", visable });
  };
}

export function setTfaList(data?: string[]) {
  return (dispatch: Dispatch) => {
    if (data) {
      dispatch({ type: "TFA_LIST", data });
      return;
    }
    getTypeList().then((res) => {
      if (res.success) {
        const data = res.data;
        dispatch({ type: "TFA_LIST", data });
      }
    });
  };
}
export function setAgreeMoonpay(data: boolean) {
  return (dispatch: Dispatch) => {
    dispatch({ type: "AGREE_MOONPAY", data });
  };
}
export function setKycInfo() {
  return (dispatch: Dispatch) => {
    getKycResult().then((res) => {
      if (res.code === "0000") {
        const data = res.data;
        dispatch({ type: "KYC_INFO", data });
      }
    });
  };
}
