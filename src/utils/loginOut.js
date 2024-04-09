import { loginOut } from "service/http/http";
import store from "store/index";
import { message } from "antd";
import history from "router/history";
import { localStorage } from "utils/storage";
import { messageError } from "utils/errorCode";
import {
  setIsLogin,
  setUser,
  setWallet,
  setDepositCoin,
  setWihdrawCoin,
  setDashboardUserData,
  setAllLogin,
} from "store/actions/publicAction";

export const setLoginOut = () => {
  loginOut().then((res) => {
    if (res.success) {
      message.warning(messageError("logOut"));
      store.dispatch(setIsLogin(false));
      store.dispatch(setWallet(false));
      localStorage.set("user", "");
      localStorage.set("flexassets", "");
      store.dispatch(setUser(""));
      store.dispatch(setDepositCoin("USDT"));
      store.dispatch(setWihdrawCoin("USDT"));
      store.dispatch(setDashboardUserData({}));
      store.dispatch(setAllLogin([]));
      localStorage.set("registerRemind", false);
      localStorage.set("securityRemind", false);
      localStorage.set("redirectPath", "");

      const stateData = store.getState();
      if (
        stateData.loginActiveTab === "metaMaskRegister" ||
        stateData.loginActiveTab === "register"
      ) {
        window.location.href = "/register";
      } else {
        window.location.href = "/login";
        // history.push("/login");
      }
    }
  });
  localStorage.set("metamaskAddress", "");
  window.localStorage.removeItem("securityRemind");
  const setting = window.location.search;
  if (setting.includes("iOS") || setting.includes("android")) {
    window.tokenError();
  }
};
export const loginOut401 = (off = true) => {
  localStorage.set("user-console", "");

  store.dispatch(setIsLogin(false));
  store.dispatch(setWallet(false));
  localStorage.set("user", "");
  localStorage.set("flexassets", "");
  store.dispatch(setUser(""));
  store.dispatch(setDepositCoin("USDT"));
  store.dispatch(setWihdrawCoin("USDT"));
  store.dispatch(setDashboardUserData({}));
  store.dispatch(setAllLogin([]));
  localStorage.set("registerRemind", false);
  localStorage.set("securityRemind", false);
  localStorage.set("redirectPath", "");
  const stateData = store.getState();
  if (off) {
    message.warning(messageError("logOut"));
  }
  if (stateData.loginActiveTab === "register") {
    window.location.href = "/register";
  } else {
    window.location.href = "/login?return=" + window.btoa(window.location.href);
    // history.push("/login");
  }
  localStorage.set("metamaskAddress", "");
  localStorage.set("secureModal", {});
  window.localStorage.removeItem("securityRemind");
  const setting = window.location.search;
  if (setting.includes("iOS") || setting.includes("android")) {
    window.tokenError();
  }
};
