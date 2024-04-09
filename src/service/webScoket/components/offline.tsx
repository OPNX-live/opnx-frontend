import React, { Component } from "react";
import ICYPropsModal from "components/modal/Modal";
import offine from "assets/image/Offine.svg";
import { offlineLogginOut } from "utils";
import "./offline.scss";
import store from "store";
import { intl } from "utils/Language";
type IOfflineState = {
  visible: number;
};
export class Offline extends Component<{ visible: number }, IOfflineState> {
  constructor(props: { visible: number }) {
    super(props);
    this.state = { visible: 1 };
  }
  componentDidMount() {
    store.subscribe(() => {
      const newStore = store.getState();
      if (newStore.isLogin) {
        this.setState({ visible: 0 });
      }
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps: any) {
    this.setState({ visible: nextProps.visible });
  }
  loginOut = () => {
    offlineLogginOut();
    this.setState({ visible: 0 });
  };
  render() {
    const { visible } = this.state;
    return this.props.visible ? (
      <ICYPropsModal
        className="offine"
        visible={visible ? true : false}
        getContainer={() => document.getElementById("offline")!}
        title={
          <>
            <img src={offine} alt="offline" />
            <p
              style={{
                fontSize: "24px",
                color: "#333333",
                marginTop: "24px",
                textAlign: "center",
                fontWeight: 400,
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
              }}
            >
              {intl("Offline notification")}
            </p>
          </>
        }
        width="424px"
        centered
        maskClosable
        destroyOnClose
        oneBigBtn
        cancleHandler={this.loginOut}
        okHandler={this.loginOut}
        okText={intl("Close")}
      >
        <div
          style={{ color: "#666666", fontSize: "16px", textAlign: "center" }}
        >
          {intl(
            "The account has been logged in on another device. If it is not operated by yourself, please change the password as soon as possible."
          )}
        </div>
      </ICYPropsModal>
    ) : null;
  }
}
function renderElement(visible: number) {
  return <>{visible ? <Offline visible={visible} /> : null}</>;
}
export default renderElement;
