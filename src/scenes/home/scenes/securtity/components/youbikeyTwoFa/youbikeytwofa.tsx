import React, { Component } from "react";
import { connect } from "react-redux";
import "./youbikeytwofa.scss";
import { Card, Input, Button, message } from "antd";
import logYouBiKey from "assets/image/log-youbikey.png";
import {
  EyeInvisibleOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ITwoFaState, EnumTwoFaType } from "../type";
import {
  setUser,
  setDashboardUserData,
  setTfaList,
} from "store/actions/publicAction";
import SendCodeInput from "components/SendCodeInput/SendCodeInput";
import {
  geetestInit,
  geetestType,
  twoFaBind,
  UserData,
} from "service/http/http";
import messageError from "utils/errorCode";
import BindTfaVerify from "components/bindTfaVerify/BindTfaVerify";
import history from "router/history";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { geetestValidatePackage } from "utils";
import gt from "utils/gt";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
import { loginOut401 } from "utils/loginOut";

type IYoubikeyTwoFaPropsState = ReturnType<typeof mapStateToProps>;
type IYoubikeyTwoFaDispatchState = ReturnType<typeof mapDispatchToProps>;
type IGoogleTwoFaProps = IYoubikeyTwoFaDispatchState &
  IYoubikeyTwoFaPropsState &
  WrappedComponentProps;

class YoubikeyTwoFa extends Component<IGoogleTwoFaProps, ITwoFaState> {
  readonly state = {
    loading: false,
    type: "password",
    validData_youbikey: {
      tfaType: EnumTwoFaType["youbike"],
      otp: "",
      // password: "",
    },
    visible: false,
    emailCode: "",
    Code: "",
  };

  geetestType() {
    if (this.props.tfaList!.length) {
      this.setState({
        visible: true,
      });
      return;
    }
    this.geetSubmit();
  }
  geetSubmit = (value?: string) => {
    this.setState({ loading: true });
    // geetestType("TFA_BIND").then((res) => {
    //   if (res.code === "0000" && res.data) {
    //     // 需要geettest
    //     this.geetest.bind(this)();
    //   } else {
    // 不需要geettest
    this.geetest(value);

    //   }
    // });
  };
  onBack = (off: boolean, code?: string, value?: string) => {
    if (off) {
      this.setState({ loading: true, Code: code! }, () =>
        this.geetSubmit(value)
      );

      return;
    }
    this.setState({ visible: false });
  };
  async geetest(value: string) {
    onRecaptchaVerify(
      "",
      "TFA_BIND",
      (token, action) => {
        this.makeTwoFaValid.bind(this, token, action, value)();
      },
      () => this.setState({ loading: false })
    );
  }
  async makeTwoFaValid(token: string, action: string, value?: string) {
    const result = await twoFaBind(
      this.state.validData_youbikey,
      this.state.Code,
      this.state.emailCode ? this.state.emailCode : value,
      token,
      action
    );
    if (result.success) {
      message.success("Please log back in with your newly set up 2FA");
      loginOut401(false);
    } else {
      message.warn(result.message);
      this.setState({ loading: false });
      return;
    }
  }
  keyUp = (e: KeyboardEvent) => {
    e.which === 13 &&
      // this.state.validData_youbikey.password &&
      this.state.validData_youbikey.otp &&
      this.geetestType.bind(this)();
  };
  componentDidMount() {
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
        title={this.props.intl.formatMessage({ id: "SetUpAuthyYubiKey" })}
        className="youbikeyTwoFa"
        bordered={false}
      >
        <div className="youbikeyTwoFa-container">
          <div className="youbikeyTwoFa-count">1</div>
          <div className="youbikeyTwoFa-content">
            <div className="youbikeyTwoFa-content-title">
              <div style={{ lineHeight: "19px", maxWidth: "520px" }}>
                {this.props.intl.formatMessage({
                  id: "YubiKey_one",
                })}
              </div>
              <br />
              <div style={{ lineHeight: "19px", maxWidth: "520px" }}>
                {this.props.intl.formatMessage({
                  id: "There_devices",
                })}
              </div>
              <br />
              <br />
              <span style={{ lineHeight: "19px", maxWidth: "520px" }}>
                {this.props.intl.formatMessage({
                  id: "Open_Exchange_accepts",
                })}
                <br />
                {this.props.intl.formatMessage({
                  id: "You_can",
                })}
                &nbsp;
                <a
                  href="https://www.amazon.com/stores/page/78D47FBE-87CB-435A-9CF6-7F13F533EAB9?ingress=2&visitId=72f3221a-a6f9-4bef-bda7-cd796dd4679e&ref_=ast_bln."
                  style={{ color: "#318BF5" }}
                  rel="nofollow noopener noreferrer"
                >
                  {this.props.intl.formatMessage({
                    id: "purchase",
                  })}
                </a>
              </span>
            </div>
            <div className="youbikeyTwoFa-content-block">
              <div className="youbikeyTwoFa-content-block-youbikey">
                <img src={logYouBiKey} alt="App Store" />
                <span>
                  {this.props.intl.formatMessage({
                    id: "YubiKey",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="youbikeyTwoFa-container">
          <div className="youbikeyTwoFa-count">2</div>
          <div className="youbikeyTwoFa-content">
            <div
              className="youbikeyTwoFa-content-title"
              style={{ marginBottom: "46px" }}
            >
              <div style={{ lineHeight: "24px", maxWidth: "520px" }}>
                When prompted for the 2FA code, touch the YubiKey button (or tap
                it if it's a NFC-enabled YubiKey) to generate the code. The 2FA
                code will automatically be entered into the field.
              </div>
            </div>
            <div className="youbikeyTwoFa-content-form">
              {this.props.tfaList?.length === 0 && (
                <SendCodeInput
                  type="BIND_TFA"
                  placeholder="Email Code"
                  change={(e) => this.setState({ emailCode: e })}
                />
              )}
              <Input
                placeholder={this.props.intl.formatMessage({ id: "tfaCode" })}
                onChange={(e) =>
                  this.setState({
                    validData_youbikey: {
                      ...this.state.validData_youbikey,
                      otp: e.target.value,
                    },
                  })
                }
              />
              {/* <div
                className="youbikeyTwoFa-content-form-icon"
                style={{
                  visibility: this.state.validData_youbikey.password
                    ? "visible"
                    : "hidden",
                }}
              >
                <CloseOutlined
                  onClick={(e) => {
                    this.setState({
                      validData_youbikey: {
                        ...this.state.validData_youbikey,
                        password: "",
                      },
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
              </div>
              <Input
                placeholder={this.props.intl.formatMessage({
                  id: "Password",
                })}
                maxLength={128}
                value={this.state.validData_youbikey.password}
                type={this.state.type}
                onChange={(e) =>
                  this.setState({
                    validData_youbikey: {
                      ...this.state.validData_youbikey,
                      password: e.target.value,
                    },
                  })
                }
                autoComplete="new-password"
              /> */}

              <Button
                type="primary"
                htmlType="submit"
                onClick={this.geetestType.bind(this)}
                loading={this.state.loading}
                disabled={
                  // this.state.validData_youbikey.password &&
                  this.state.validData_youbikey.otp &&
                  (this.props.tfaList?.length === 0
                    ? this.state.emailCode
                    : true)
                    ? false
                    : true
                }
                style={{ marginTop: "34px" }}
              >
                {this.props.intl.formatMessage({
                  id: "Submit",
                })}
              </Button>
            </div>
          </div>
        </div>
        <BindTfaVerify
          visible={visible}
          onBack={this.onBack}
          loading={loading}
        />
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

const mapDispatchToProps = (dispatch: Function) => {
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
)(injectIntl(YoubikeyTwoFa));
