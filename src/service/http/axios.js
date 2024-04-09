import axios from "axios";
import { message, notification } from "antd";
import store from "../../store/index";
import history from "router/history";
import { checkToken } from "../config";
import { loginOut401 } from "utils/loginOut";

import { setIsLogin } from "store/actions/publicAction";
import React from "react";
import ErrorIcon from "assets/image/ErrorIcon.svg";
// import { loginOut } from "./http";
// import { localStorage } from "utils/storage";
import { messageError } from "utils/errorCode";

const CancelToken = axios.CancelToken;
axios.defaults.timeout = 60000;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded; charset=utf-8";
axios.defaults.headers.get["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.headers.put["Content-Type"] = "application/json; charset=utf-8";
axios.defaults.headers.delete["Content-Type"] =
  "application/json; charset=utf-8";

axios.defaults.withCredentials = true;
// axios.defaults.headers["access-control-allow-credentials"] = true;

message.config({
  top: 80,
  duration: 3,
  maxCount: 1,
});
axios.interceptors.request.use(
  (config) => {
    const stateData = store.getState();
    if (!checkToken(config.url)) {
      !config.headers["xOPNXtoken"] &&
        (config.headers["xOPNXtoken"] = stateData.users.token ?? "");
    }
    const requestName =
      config.method === "get" || config.method === "delete"
        ? config.params
          ? config.params.requestName
          : null
        : config.data.requestName;
    //判断，如果这里拿到上一次的requestName，就取消上一次的请求
    if (requestName) {
      if (axios[requestName] && axios[requestName].cancel) {
        axios[requestName].cancel();
      }
      config.cancelToken = new CancelToken((c) => {
        axios[requestName] = {};
        axios[requestName].cancel = c;
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const errMessage = () => {
  message.warning("Requests are too frequent, please wait 30s and try again ");
};
// interceptor response
axios.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (
      res?.code === "000" &&
      res?.data &&
      res?.data.loginId &&
      res?.data.accountId
    ) {
      store.dispatch(setIsLogin(res.success));
    }
    // USER_INFO_URL.USER_DATA
    //这里根据后台返回来设置
    notification.close("Disconnect");
    if (res?.code !== undefined) {
      switch (res.code) {
        case "0000":
          return res;
        default:
          return Promise.resolve(res);
      }
    } else {
      return res;
    }
  },

  (error) => {
    if (error.response) {
      // console.log(JSON.stringify(error.response.data));
      switch (error.response.status) {
        case 404:
          history.push("/404");
          return Promise.resolve(error.response.data);
        case 400:
          try {
            if (error.response.data.code === "35027") {
              return Promise.resolve(error.response.data);
            } else {
              return Promise.resolve(error.response.data);
            }
          } catch (err) {
            return {
              status: 500,
              errors: [
                {
                  message: "Something went wrong",
                },
              ],
            };
          }
        case 401:
          loginOut401();
          return Promise.reject("401");
        case 429:
          errMessage();
          return Promise.reject("429");
        case 500:
          try {
            error.response.data.code = "500";
            history.push("/500");
            return Promise.resolve(error.response.data);
          } catch (err) {
            notification.error({
              message: messageError("Disconnect"),
              duration: 60,
              key: "Disconnect",
              icon: <img src={ErrorIcon} alt="Error" />,
            });
            return {
              status: 500,
              errors: [
                {
                  message: "Something went wrong",
                },
              ],
            };
          }

        case 503:
          try {
            error.response.data.code = "503";
            return Promise.resolve("503");
          } catch (err) {
            return {
              status: 500,
              errors: [
                {
                  message: "Something went wrong",
                },
              ],
            };
          }
        default:
          return Promise.reject(error.response.data);
      }
    } else {
      error.response = {
        data: {
          code: "Disconnect",
          success: false, //为了兼容robert 的骚操作
        },
      };
      notification.error({
        message: messageError("Disconnect"),
        duration: 60,
        key: "Disconnect",
        icon: <img src={ErrorIcon} alt="Error" />,
      });
      return Promise.resolve(error.response.data);
    }
  }
);
/**
 * GET
 * @param url
 * @param params
 * @param callback
 * @param config
 */
export function fetch(url, params = {}, callback = () => {}, config = {}) {
  return new Promise((resolve, reject) => {
    axios
      .get(process.env.REACT_APP_HTTP_URL + url, {
        params,
        ...config,
      })
      .then((response) => {
        if (response) {
          resolve(response);
        } else {
          resolve(response);
        }
      })
      .catch(reject)
      .then(callback);
  });
}

/**
 * GET
 * @param url
 * @param params
 * @param callback
 * @param config
 */
export function fetchMoonpay(
  url,
  params = {},
  callback = () => {},
  config = {}
) {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.moonpay.com/" + url, {
        params,
        ...config,
      })
      .then((response) => {
        if (response) {
          resolve(response);
        } else {
          resolve(response);
        }
      })
      .catch(reject)
      .then(callback);
  });
}

/**
 * POST
 * @param url
 * @param data
 * @param callback
 * @param config
 */

export function post(url, data = {}, callback = () => {}, config = {}) {
  return new Promise((resolve, reject) => {
    axios
      .post(process.env.REACT_APP_HTTP_URL + url, data, {
        ...config,
      })
      .then((response) => {
        if (response && response.code === "0000") {
          resolve(response);
        } else {
          resolve(response);
        }
      })
      .catch(reject)
      .then(callback);
  });
}

/**
 * PUT
 * @param url
 * @param data
 */

export function put(url, data = {}, callback = () => {}) {
  return new Promise((resolve, reject) => {
    axios
      .put(process.env.REACT_APP_HTTP_URL + url, data)
      .then((response) => {
        if (response && response.code === "0000") {
          resolve(response);
        } else {
          reject(response);
        }
      })
      .catch(reject)
      .then(callback);
  });
}

/**
 * DELETE
 * @param url
 * @param params
 * @param callback
 * @param config
 */

export function del(url, params = {}, callback = () => {}, config = {}) {
  return new Promise((resolve, reject) => {
    axios
      .delete(process.env.REACT_APP_HTTP_URL + url, {
        data: params,
      })
      .then((response) => {
        if (response && response.code === "0000") {
          resolve(response);
        } else {
          reject(response);
        }
      })
      .catch(reject)
      .then(callback);
  });
}

export function uploadFile(url, data = {}, callback = () => {}) {
  return new Promise((resolve, reject) => {
    axios
      .post(process.env.REACT_APP_HTTP_URL + url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response && response.code === "0000") {
          resolve(response);
        } else {
          reject(response);
        }
      })
      .catch(reject)
      .then(callback);
  });
}

/**
 * POST method request form data
 * @param url
 * @param data
 * @param callback
 * @param config
 */

export function postForm(url, data = {}, callback = () => {}, config = {}) {
  return post(process.env.REACT_APP_HTTP_URL + url, data, callback, {
    transformRequest: [
      function (data) {
        let ret = "";
        for (const it in data) {
          ret +=
            encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
        }
        return ret;
      },
    ],
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    withCredentials: true,
    ...config,
  });
}
