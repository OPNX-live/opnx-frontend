import React, { Component } from "react";
import { connect } from "react-redux";
import "./authytwofa.scss";
import { Card, Input, Button, message } from "antd";
import googlePay from "assets/image/google-play.svg";
import appStore from "assets/image/app-store.svg";
import QRCode from "qrcode.react";
import { ITwoFaState, EnumTwoFaType } from "../type";
import {
  geetestInit,
  geetestType,
  twoFaBind,
  twoFaValid,
  UserData,
} from "service/http/http";
import { geetestValidatePackage, messageError } from "utils";
import BindTfaVerify from "components/bindTfaVerify/BindTfaVerify";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  setUser,
  setDashboardUserData,
  setTfaList,
} from "store/actions/publicAction";
import history from "router/history";
import { WrappedComponentProps, injectIntl } from "react-intl";
import gt from "utils/gt";
import SendCodeInput from "components/SendCodeInput/SendCodeInput";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
import { loginOut401 } from "utils/loginOut";

type IAuthyTwoFaPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IAuthyTwoFaDispatchState = ReturnType<typeof mapDispatchToProps>;
type IAuthyTwoFaProps = IAuthyTwoFaPropsState & IAuthyTwoFaDispatchState;
class AuthyTwoFa extends Component<IAuthyTwoFaProps, ITwoFaState> {
  readonly state = {
    loading: false,
    type: "password",
    tFaBindState: {
      tfaType: EnumTwoFaType["authy"],
    },
    qrCodeData: {
      qrData: "",
      secret: "",
    },
    validData: {
      tfaCode: "",
      // password: "",
      tfaType: "AUTHY_SECRET",
    },
    visible: false,
    emailCode: "",
    Code: "",
  };
  constructor(props: IAuthyTwoFaProps) {
    super(props);
    this.makeTwoFaBind = this.makeTwoFaBind.bind(this);
  }
  geetestType() {
    if (this.props.tfaList!.length) {
      this.setState({
        visible: true,
      });
      return;
    }
    this.setState({
      loading: true,
      validData: this.state.validData,
      Code: "",
    });
    this.geetSubmit();
  }
  geetSubmit = (value?: string) => {
    // geetestType("TFA_BIND_VALID").then((res) => {
    //   if (res.code === "0000" && res.data) {
    //     // 需要geettest
    //     this.geetest.bind(this)();
    //   } else {
    // 不需要geettest
    this.geetest(value);
    //   }
    // });
  };
  async geetest(value: string) {
    this.setState({ loading: true });
    onRecaptchaVerify(
      "",
      "TFA_BIND_VALID",
      (token, action) => {
        this.makeTwoFaValid.bind(this, token, action, value)();
      },
      () => this.setState({ loading: false, visible: false })
    );
  }
  async makeTwoFaBind() {
    const result = await twoFaBind(this.state.tFaBindState, "");
    result.code === "0000" &&
      this.setState({
        qrCodeData: {
          qrData: result.data.data.qrData,
          secret: result.data.data.secret,
        },
      });
  }
  onBack = (off: boolean, code?: string, value?: string) => {
    if (off) {
      this.setState({ loading: true, Code: code! }, () => this.geetest(value));
      return;
    }
    this.setState({ visible: false });
  };
  async makeTwoFaValid(token: string, action: string, value?: string) {
    this.setState({ loading: true });
    const result = await twoFaValid(
      this.state.validData,
      this.state.Code,
      this.state.emailCode ? this.state.emailCode : value,
      token,
      action
    );
    if (result.success) {
      message.success("Please log back in with your newly set up 2FA");
      loginOut401(false);
      // setTimeout(async () => {
      //   this.props.setTfaList();
      //   const user = await UserData(token, action);
      //   user.success && this.props.setDashboardUserData(user.data);
      // }, 500);
    } else {
      this.setState({ loading: false, visible: false });
      message.warn(result.message);
      return;
    }
  }
  keyUp = (e: KeyboardEvent) => {
    e.which === 13 &&
      // this.state.validData.password &&
      this.state.validData.tfaCode &&
      this.geetest.bind(this)();
  };
  componentWillMount() {
    this.makeTwoFaBind();
    if (!this.props.tfaList!.length) {
      window.addEventListener("keypress", this.keyUp);
    }
  }
  componentWillUnmount() {
    window.removeEventListener("keypress", this.keyUp);
  }
  render() {
    const { visible, loading } = this.state;
    return (
      <Card
        title={this.props.intl.formatMessage({ id: "SetUpAuthy" })}
        className="authyTwoFa"
        bordered={false}
      >
        <div className="authyTwoFa-container">
          <div className="authyTwoFa-count">1</div>
          <div className="authyTwoFa-content">
            <div className="authyTwoFa-content-title">
              {this.props.intl.formatMessage({
                id: "Download_authy_app",
              })}
            </div>
            <div className="authyTwoFa-content-block">
              <div
                className="authyTwoFa-content-block-down"
                onClick={() => {
                  window.open(
                    "https://apps.apple.com/us/app/authy/id494168017"
                  );
                }}
              >
                <img src={appStore} alt="App Store" />
                <div className="authyTwoFa-contnet-block-text">
                  <span>
                    {this.props.intl.formatMessage({
                      id: "Download_from",
                    })}
                  </span>
                  <span>
                    {this.props.intl.formatMessage({
                      id: "App_Store",
                    })}
                  </span>
                </div>
              </div>
              <div
                className="authyTwoFa-content-block-down"
                onClick={() => {
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.authy.authy"
                  );
                }}
              >
                <img src={googlePay} alt="Google Play" />
                <div className="authyTwoFa-contnet-block-text">
                  <span>
                    {this.props.intl.formatMessage({
                      id: "Download_from",
                    })}
                  </span>
                  <span>
                    {this.props.intl.formatMessage({
                      id: "Google_Play",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="authyTwoFa-container">
          <div className="authyTwoFa-count">2</div>
          <div className="authyTwoFa-content">
            <div
              className="authyTwoFa-content-title"
              style={{ marginBottom: "32px" }}
            >
              <div style={{ lineHeight: "24px", maxWidth: "520px" }}>
                {this.props.intl.formatMessage({
                  id: "after_installation_authy",
                })}
              </div>
            </div>
            <div className="authyTwoFa-content-block-qrCode">
              <div className="authyTwoFa-content-block-qrCode-img">
                <QRCode
                  value={this.state.qrCodeData.qrData}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="authyTwoFa-container">
          <div className="authyTwoFa-count">3</div>
          <div className="authyTwoFa-content">
            <div
              className="authyTwoFa-content-title"
              style={{ marginBottom: "32px" }}
            >
              <div style={{ lineHeight: "24px", maxWidth: "520px" }}>
                {`Please enter your 8-digit 2FA code ${
                  this.props.tfaList.length === 0
                    ? "and email verification code"
                    : ""
                } below to complete the registration`}
              </div>
            </div>
            <div className="authyTwoFa-content-form">
              {/* <div
                className="authyTwoFa-content-form-icon"
                style={{
                  visibility: this.state.validData.password
                    ? "visible"
                    : "hidden",
                }}
              >
                <CloseOutlined
                  onClick={() => {
                    this.setState({
                      validData: { ...this.state.validData, password: "" },
                    });
                  }}
                />
                {this.state.type === "password" && (
                  <EyeInvisibleOutlined
                    onClick={() => this.setState({ type: "text" })}
                  />
                )}
                {this.state.type === "text" && (
                  <EyeOutlined
                    onClick={() => this.setState({ type: "password" })}
                  />
                )}
              </div> */}
              {/* <Input
                placeholder="Password"
                maxLength={128}
                value={this.state.validData.password}
                type={this.state.type}
                onChange={(e) =>
                  this.setState({
                    validData: {
                      ...this.state.validData,
                      password: e.target.value,
                    },
                  })
                }
              /> */}
              {this.props.tfaList?.length === 0 && (
                <SendCodeInput
                  type="BIND_TFA"
                  placeholder="Email Code"
                  change={(e) => this.setState({ emailCode: e })}
                />
              )}
              <Input
                placeholder="2FA Code"
                maxLength={64}
                onChange={(e) =>
                  this.setState({
                    validData: {
                      ...this.state.validData,
                      tfaCode: e.target.value,
                    },
                  })
                }
              />
              <Button
                type="primary"
                onClick={this.geetestType.bind(this)}
                loading={this.state.loading}
                disabled={
                  // this.state.validData.password &&
                  this.state.validData.tfaCode &&
                  (this.props.tfaList?.length === 0
                    ? this.state.emailCode
                    : true)
                    ? false
                    : true
                }
                style={{ marginTop: "18px" }}
              >
                {this.props.intl.formatMessage({
                  id: "Submit",
                })}
              </Button>
            </div>
          </div>
        </div>
        {visible && (
          <BindTfaVerify
            visible={visible}
            onBack={this.onBack}
            loading={loading}
          />
        )}
      </Card>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => {
  return {
    users: state.users,
    userData: state.dashboardUserData,
    tfaList: state.tfaList,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser(data: Iusers) {
      dispatch(setUser(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    setTfaList() {
      dispatch(setTfaList());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AuthyTwoFa));
