import { localStorage } from "./storage";
import { geetestValidate } from "service/http/http";
import { message } from "antd";
import moment from "moment";
import { loginOut } from "../service/http/http";
import store from "store";
import {
  setIsLogin,
  setUser,
  setWallet,
  switchLoginActiveTab,
} from "store/actions/publicAction";
import { intl } from "utils/Language";
import { notification } from "antd";
export const hintMessage = () => {
  const args = {
    message: "",
    description: "To increase your account SECURITY, please enable 2FA.",
    duration: 5,
  };
  notification.open(args);
};

//判断是否为正整数,返回true或false
export function isPositiveIntegerTimes(arg) {
  var num = arg.toString();
  if (!/(^[1-9]\d*$)/.test(num)) {
    return false;
  } else {
    return true;
  }
}
export function tradingType(status) {
  let type = status;
  if (status && typeof status === "object") {
    type = status[0];
  }
  if (type === "INVERSE_BTC") {
    return "inverse-BTC";
  } else if (type === "INVERSE_ETH") {
    return "inverse-ETH";
  } else if (type === "LINEAR") {
    return "Linear-USD";
  } else if (type === "TRADING") {
    return "Trading";
  } else {
    return type;
  }
}

export function balanceTradingType(status) {
  let type = status;
  if (typeof status === "object") {
    type = status[0];
  }
  if (type === "INVERSE_BTC") {
    return "BTC";
  } else if (type === "INVERSE_ETH") {
    return "ETH";
  } else if (type === "LINEAR") {
    return "USDT";
  } else if (type === "TRADING") {
    return "Trading";
  } else {
    return "USDT";
  }
}
export function marketCommunication(data) {
  localStorage.set("user", data);
}

export function toUtc(date) {
  const str = moment(date).format("YYYY-MM-DD 00:00:00");
  return moment(str).utc().format("YYYY-MM-DD HH:mm:ss");
}

export function toUtcNumber(date) {
  const str = moment(date).format("YYYY-MM-DD 00:00:00");
  return moment(str).utc().valueOf();
}

const accountIdList = [
  200447, 200454, 200578, 200667, 200749, 200811, 2959, 3260, 2175, 2351, 2051,
  2191, 201731, 236974, 149, 695, 230,
];
export const whiteList = (id) => {
  let off = false;
  accountIdList.map((i) => {
    if (id * 1 === i) off = true;
    return false;
  });
  return off;
};

export const PrevDay = (days, type) => {
  return [
    moment().subtract(days, type).format("YYYY-MM-DD 00:00:00"),
    moment().format("YYYY-MM-DD 00:00:00"),
  ];
};
export const geetestValidatePackage = (obj, data, success, error) => {
  obj.appendTo("#captcha");
  obj
    .onReady(function () {
      obj.verify();
    })
    .onSuccess(() => {
      const result = obj.getValidate();
      const nextData = {
        geetest_challenge: result.geetest_challenge,
        geetest_validate: result.geetest_validate,
        geetest_seccode: result.geetest_seccode,
        clientType: "web",
        ...data,
      };
      geetestValidate(nextData)
        .then((resGeestest) => {
          if (resGeestest.status === "success") {
            success();
          } else {
            error();
            message.warning(intl("VerificationFailed"));
            obj.reset();
          }
        })
        .catch((err) => {
          error();
          message.warning(intl("VerificationFailed"));
          obj.reset();
        });
    })
    .onClose(() => {
      error();
      message.warning(intl("PleaseCompleteVerification"));
    })
    .onError((err) => {
      error();
      throw new Error(err);
    });
};
export const loginOutEvent = () => {
  loginOut().then((res) => {
    if (res.success) {
      store.dispatch(setIsLogin(false));
      store.dispatch(setWallet(false));
      localStorage.set("user", "");
      store.dispatch(setUser(""));
      store.dispatch(switchLoginActiveTab("login"));
      window.location.href = "/login";
      // history.push("/login");
    }
  });
};
export const offlineLogginOut = () => {
  store.dispatch(setUser(""));
  store.dispatch(setIsLogin(false));
  store.dispatch(setWallet(false));
  store.dispatch(switchLoginActiveTab("login"));
  window.location.href = "/login";
  //   history.push("/login");
};
export const comparedDate = (date) => {
  const [startDate, endDate] = date;
  // prevThreeMonthsDdate["结束时间"，“结束时间-3个月”]
  const prevThreeMonthsDdate = [
    moment(endDate).format("YYYY-MM-DD"),
    moment(endDate).subtract(3, "months").format("YYYY-MM-DD"),
  ];
  return moment(startDate).isBetween(
    prevThreeMonthsDdate[1],
    prevThreeMonthsDdate[0],
    undefined,
    "[]"
  );
};

//生成随机 GUID 数
export const guid = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
};
//获取本月第一天和最后一天
export const getMonthStartOrEnd = () => {
  //获取当前时间
  let date = new Date();
  //获取当前月的第一天
  let monthStart = date.setDate(1);
  //获取当前月
  let currentMonth = date.getMonth();
  //获取到下一个月，++currentMonth表示本月+1，一元运算
  let nextMonth = ++currentMonth;
  //获取到下个月的第一天
  let nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
  //一天时间的毫秒数
  let oneDay = 1000 * 60 * 60 * 24;

  //获取当前月第一天和最后一天
  let firstDay = moment(monthStart).format("YYYY-MM-DD");
  //nextMonthFirstDay-oneDay表示下个月的第一天减一天时间的毫秒数就是本月的最后一天
  let lastDay = moment(nextMonthFirstDay - oneDay).format("YYYY-MM-DD");

  return {
    firstDay,
    lastDay,
  };
};
export function getUrlToken(name, str) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
  const r = str.substr(1).match(reg);
  if (r != null) return decodeURIComponent(r[2]);
  return null;
}
