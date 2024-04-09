import React, { Component } from "react";
import { connect } from "react-redux";
import "./googletwofa.scss";
import { Card, Input, Button, message } from "antd";
import googlePay from "assets/image/google-play.svg";
import appStore from "assets/image/app-store.svg";
import iconWarning from "assets/image/icon-warning.svg";
import copyIcon from "assets/image/_copy.svg";
import { messageSuccess, messageError } from "utils";
import QRCode from "qrcode.react";
import copy from "copy-to-clipboard";
import { ITwoFaState, EnumTwoFaType } from "../type";
import BindTfaVerify from "components/bindTfaVerify/BindTfaVerify";
import { twoFaBind, twoFaValid, UserData } from "service/http/http";
import {
  setUser,
  setDashboardUserData,
  setTfaList,
} from "store/actions/publicAction";
import history from "router/history";
import { injectIntl, WrappedComponentProps } from "react-intl";
import SendCodeInput from "components/SendCodeInput/SendCodeInput";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
import { loginOut401 } from "utils/loginOut";

type IGoogleTwoFaPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IGoogleTwoFaDispatchState = ReturnType<typeof mapDispatchToProps>;
type IGoogleTwoFaProps = IGoogleTwoFaPropsState & IGoogleTwoFaDispatchState;
class GoogleTwoFa extends Component<IGoogleTwoFaProps, ITwoFaState> {
  readonly state = {
    loading: false,
    type: "password",
    tFaBindState: {
      tfaType: EnumTwoFaType["google"],
    },
    qrCodeData: {
      qrData: "",
      secret: "",
    },
    validData: {
      tfaCode: "",
      // password: "",
      tfaType: "GOOGLE",
    },
    visible: false,
    emailCode: "",
    Code: "",
  };
  constructor(props: IGoogleTwoFaProps) {
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
    //     // 不需要geettest
    this.geetest(value);
    //   }
    // });
  };
  async geetest(value: string) {
    onRecaptchaVerify(
      "",
      "TFA_BIND_VALID",
      (token, action) => {
        this.makeTwoFaValid.bind(this, token, action, value)();
      },
      () => this.setState({ loading: false })
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
      this.setState(
        {
          loading: true,
          validData: { ...this.state.validData },
          Code: code!,
        },
        () => {
          console.log("code", code);
          this.geetest(value);
        }
      );

      return;
    }
    this.setState({ visible: false });
  };
  async makeTwoFaValid(token: string, action: string, value?: string) {
    this.setState({ loading: true });
    console.log(this.state.Code);
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
    } else {
      this.setState({ loading: false });
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
        title={this.props.intl.formatMessage({ id: "SetUpAuthyGoogle" })}
        className="googleTwoFa"
        bordered={false}
      >
        <div className="googleTwoFa-container">
          <div className="googleTwoFa-count">1</div>
          <div className="googleTwoFa-content">
            <div className="googleTwoFa-content-title">
              {this.props.intl.formatMessage({
                id: "Download_app",
              })}
            </div>
            <div className="googleTwoFa-content-block">
              <div
                className="googleTwoFa-content-block-down"
                onClick={() => {
                  window.open(
                    "https://apps.apple.com/us/app/google-authenticator/id388497605"
                  );
                }}
              >
                <img src={appStore} alt="App Store" />
                <div className="googleTwoFa-contnet-block-text">
                  <span>
                    {this.props.intl.formatMessage({
                      id: "Download_from",
                    })}
                  </span>
                  <span className="app-store">
                    {this.props.intl.formatMessage({
                      id: "App_Store",
                    })}
                  </span>
                </div>
              </div>
              <div
                className="googleTwoFa-content-block-down"
                onClick={() => {
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                  );
                }}
              >
                <img src={googlePay} alt="Google Play" />
                <div className="googleTwoFa-contnet-block-text">
                  <span>
                    {this.props.intl.formatMessage({
                      id: "Download_from",
                    })}
                  </span>
                  <span className="app-store">
                    {this.props.intl.formatMessage({
                      id: "Google_Play",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="googleTwoFa-container">
          <div className="googleTwoFa-count">2</div>
          <div className="googleTwoFa-content">
            <div
              className="googleTwoFa-content-title"
              style={{ marginBottom: "14px" }}
            >
              <div style={{ lineHeight: "24px", maxWidth: "520px" }}>
                {this.props.intl.formatMessage({
                  id: "after_installation",
                })}
              </div>
            </div>
            <div className="googleTwoFa-content-warn">
              <img src={iconWarning} alt="Warning" />
              <div style={{ maxWidth: "520px" }}>
                {this.props.intl.formatMessage({
                  id: "IMPORTANT",
                })}
              </div>
            </div>
            <div className="googleTwoFa-content-block-qrCode">
              <div className="googleTwoFa-content-block-qrCode-img">
                <QRCode
                  value={this.state.qrCodeData.qrData}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className="googleTwoFa-content-block-qrCode-inputs">
                <div>
                  {this.props.intl.formatMessage({
                    id: "Key",
                    defaultMessage: "Key",
                  })}
                </div>
                <div className="googleTwoFa-content-block-qrCode-input">
                  <div>{this.state.qrCodeData.secret}</div>
                  <img
                    src={copyIcon}
                    alt="copy"
                    onClick={() => {
                      copy(this.state.qrCodeData.secret)
                        ? message.success(messageSuccess("30001"))
                        : message.warn(messageError("35001"));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="googleTwoFa-container">
          <div className="googleTwoFa-count">3</div>
          <div className="googleTwoFa-content">
            <div
              className="googleTwoFa-content-title"
              style={{ marginBottom: "32px", maxWidth: "520px" }}
            >
              <span style={{ lineHeight: "24px" }}>
                {`Please enter your 6-digit 2FA code ${
                  this.props.tfaList.length === 0
                    ? "and email verification code"
                    : ""
                } below to complete the registration`}
              </span>
            </div>
            <div className="googleTwoFa-content-form">
              {this.props.tfaList?.length === 0 && (
                <SendCodeInput
                  type="BIND_TFA"
                  placeholder="Email Code"
                  change={(e) => this.setState({ emailCode: e })}
                />
              )}
              <Input
                placeholder={this.props.intl.formatMessage({ id: "tfaCode" })}
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
                htmlType="submit"
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
          {visible && (
            <BindTfaVerify
              visible={visible}
              onBack={this.onBack}
              loading={loading}
            />
          )}
        </div>
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
)(injectIntl(GoogleTwoFa));
