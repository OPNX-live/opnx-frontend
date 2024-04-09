import React, { Component } from "react";
import { connect } from "react-redux";
import ErrorEmial from "assets/image/errorEmail.svg";
import history from "router/history";
import { reSendMail, geetestInit } from "service/http/http";
import { storage } from "utils/storage";
import { message } from "antd";
import messageError from "utils/errorCode";
import gt from "utils/gt";
import "./index.scss";
import { geetestValidatePackage } from "utils";
import { FormattedMessage } from "react-intl";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";

let time: number = 120;
type IErrorVerfiy = { restEmail: boolean; timing: number };
type IErrorPropsDispatch = ReturnType<typeof mapStateToProps>;
let off = true;
class ErrorVerfiy extends Component<IErrorPropsDispatch, IErrorVerfiy> {
  private timer: any;
  constructor(props: any) {
    super(props);
    this.state = {
      restEmail: false,
      timing: 0,
    };
  }
  componentDidMount() {
    time = storage.get("Timing") ? storage.get("Timing") : time;
    if (!history.location.state) {
      window.location.href = "/login";
      // history.replace('/login');
    }
    if (storage.get("Timing")) {
      this.setState({ restEmail: true, timing: time });
      this.setTime();
    }
  }
  setTime = () => {
    this.timer = setInterval(() => {
      this.setState({ restEmail: true });
      time--;
      this.setState({ timing: time });
      storage.set("Timing", time);
      if (time === 0) {
        clearInterval(this.timer);
        this.setState({ restEmail: false, timing: 120 });
        storage.set("Timing", 0);
        time = 120;
      } else if (time < 0) {
        clearInterval(this.timer);
        this.setState({ restEmail: false, timing: 120 });
        storage.set("Timing", 0);
        time = 120;
      }
    }, 1000);
  };
  componentWillUnmount() {
    clearInterval(this.timer);
    storage.set("Timing", "");
  }
  handler = (obj: any) => {
    const state: any = history.location.state;
    const data = {
      geetestType: "RESEND_EMAIL",
      email: state.email,
    };
    const that = this;
    geetestValidatePackage(
      obj,
      data,
      () => {
        reSendMail(state.email, state.type)
          .then((res) => {
            off = true;
            if (res.code === "0000") {
              reSendMail(state!.email, state.type).then((res) => {
                if (res.code === "0000") {
                  that.setState({ restEmail: true, timing: 120 });
                  that.setTime();
                  that.setState({ restEmail: true, timing: 120 });
                  message.success("Successfully order");
                } else {
                  message.error(res.message);
                }
              });
            } else {
              message.error(res.message);
            }
          })
          .catch((error) => {
            off = true;
          });
      },
      () => {
        off = true;
      }
    );
  };
  sendEmail = () => {
    const state: any = history.location.state;
    const that = this;
    if (off) {
      off = false;
      if (!this.state.restEmail) {
        onRecaptchaVerify(
          "",
          "RESEND_EMAIL",
          (token, action) => {
            reSendMail(state.email, state.type, token, action)
              .then((res) => {
                off = true;
                if (res.code === "0000") {
                  reSendMail(state!.email, state.type).then((res) => {
                    if (res.code === "0000") {
                      that.setState({ restEmail: true, timing: 120 });
                      that.setTime();
                      that.setState({ restEmail: true, timing: 120 });
                      message.success("Successfully order");
                    } else {
                      message.error(res.message);
                    }
                  });
                } else {
                  message.error(res.message);
                }
              })
              .catch((error) => {
                off = true;
              });
          },
          () => {
            off = true;
          }
        );
      }
    }
  };
  render() {
    const { restEmail, timing } = this.state;
    return (
      <div className="errorVerfiy">
        <img src={ErrorEmial} alt="logo" className="errorVerfiy-img" />
        <p className="errorVerfiy-content">
          <FormattedMessage
            id="ItSeemsThat"
            defaultMessage="It seems that your confirmation link didn’t work. Perhaps you have already confirmed your address? Try logging in to verify."
          />
        </p>
        <div
          className="errorVerfiy-btn"
          onClick={() => {
            if (this.props.isLogin) {
              history.push("/home");
            } else {
              window.location.href = "/login";
            }
          }}
        >
          <FormattedMessage id="Login" defaultMessage="Log in" />
        </div>
        <div className="errorVerfiy-content-title1">
          <FormattedMessage
            id="requestVerification"
            defaultMessage="If you can't log in, you can try to request a new verification email"
          />
        </div>
        <div
          className="errorVerfiy-resend-email"
          style={{ color: restEmail ? "#666666" : "" }}
          onClick={this.sendEmail}
        >
          <FormattedMessage id="Resend_email" defaultMessage="Resend email" />
          &gt;&gt;{restEmail ? " (" + timing + "S)" : ""}
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    isLogin: state.isLogin,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ErrorVerfiy);
