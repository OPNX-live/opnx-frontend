import { sendMessage } from "./config";
import store from "store";
import renderElement from "./components/offline";
import { render } from "react-dom";
import { eventMessage } from "./data";
import { messageError } from "utils";
import { message } from "antd";
import { setTicker } from "store/actions/publicAction";
import { localStorage } from "utils/storage";
const WebSocketUrl = process.env.REACT_APP_WEBSOCKET_URL;
let timer: any;
let timerSecond: any;
let off = true;
class OPNXWebsocket {
  private websocket: WebSocket | null = null;
  private reConnect: boolean = false;
  private reConnectCount: number = 1000;
  open() {
    this.reConnect = false;
    this.reConnectCount = 1000;
  }
  init() {
    if (off) {
      off = false;
      this.websocket = new WebSocket(WebSocketUrl!);
      this.websocket!.onmessage = (e: WebSocketMessageEvent) => {
        this.onMessage(e);
      };
      this.websocket!.onclose = (e) => {
        this.onClose();
        clearInterval(timerSecond);
      };
      this.websocket!.onopen = () => {
        sendMessage.link();
      };
      this.websocket!.onerror = (e) => {
        clearInterval(timer);
        clearInterval(timerSecond);
      };
    }
  }
  onClose() {
    this.reConnect = true;
    const that = this;
    timer = setInterval(() => {
      if (this.reConnectCount > 0 && this.reConnect) {
        that.init();
      } else {
        clearInterval(timerSecond);
        clearInterval(timer);
      }
      this.reConnectCount--;
    }, 10000);
  }
  initiativeClose() {
    try {
      this.websocket!.close();
    } catch {}
  }
  send(evtent: any, callback?: any) {
    if (this.websocket && this.websocket.readyState === this.websocket.OPEN) {
      this.wsSend(evtent);
    } else if (
      this.websocket &&
      this.websocket.readyState === this.websocket.CONNECTING
    ) {
      setTimeout(() => {
        this.send(evtent, callback);
      }, 1000);
    } else {
      setTimeout(() => {
        if (this?.websocket?.readyState === this.websocket.CONNECTING) {
          this.send(evtent, callback);
        }
      }, 1000);
    }
    clearInterval(timer);
    // 如果链接成功 清除定时器
    if (this.websocket?.readyState === 1) {
      timerSecond = setInterval(() => {
        if (this?.websocket?.readyState === this.websocket.CONNECTING) {
          this?.websocket?.send?.("ping");
        }
      }, 30000);
    }
  }

  wsSend(evtent: SendMessageEvent, callback?: any) {
    this.websocket && this.websocket.send(JSON.stringify(evtent));
  }
  onMessage(e: WebSocketMessageEvent) {
    let list;
    try {
      list = JSON.parse(e.data);
      if (list && list.table === "ticker" && list.table) {
        // console.log(list.data);
        store.dispatch(setTicker(list.data));
      }
    } catch (err) {
      list = e.data;
    }
    if (typeof list === "object") {
      off = true;
      if (list.event === "logout") {
        this.websocket?.close();
        this.reConnectCount = -1;
        clearInterval(timer);
        clearInterval(timerSecond);
      }
      if (list.code && list.code !== "20005" && list.code !== "0000") {
        this.websocket?.close();
        this.reConnectCount = -1;
        clearInterval(timer);
        clearInterval(timerSecond);
      }
      if (list.event === "accountLogin") {
        if (store.getState().isLogin) {
          clearInterval(timer);
          clearInterval(timerSecond);
          this.reConnectCount = -1;
          render(
            renderElement(Math.ceil(Math.random() * 1000)),
            document.getElementById("offline")!
          );
        }
      }
      if (eventMessage[list.event] && list.code !== "0000") {
        localStorage.set("websocket", list.code);
        message.error(messageError(list.code));
      }
    }
    return;
  }
}

export const OPNXWebsocketInstance = new OPNXWebsocket();
export default OPNXWebsocketInstance;
