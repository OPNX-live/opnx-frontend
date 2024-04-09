import OPNXWebsocketInstance from "./index";
import store from "store";
class sendMessageWebSocket {
  private token: string = "";
  private loginId: string = "";
  init(
    prevToken = store.getState().users.token,
    prevloginId = store.getState().users.loginId
  ) {
    this.loginId = prevloginId;
    this.token = prevToken;
    if (prevToken && prevloginId) {
      OPNXWebsocketInstance.init();
      OPNXWebsocketInstance.open();
    }
  }
  link() {
    if (this.token !== "" && this.loginId !== "") {
      OPNXWebsocketInstance.send({
        op: "login",
        data: { xCfToken: this.token, loginID: this.loginId },
      });
    } else {
      // clearInterval(timerSecond);
      OPNXWebsocketInstance.initiativeClose();
    }
  }
  subscribe(params: any) {
    OPNXWebsocketInstance.send({
      args: [params],
      op: "subscribe",
      tag: new Date().getTime(),
    });
  }
  unsubscribe(params: any) {
    OPNXWebsocketInstance.send({
      args: [params],
      op: "unsubscribe",
      tag: new Date().getTime(),
    });
  }
  close() {
    OPNXWebsocketInstance.initiativeClose();
  }
}
export const sendMessage = new sendMessageWebSocket();
