import React, { Component } from "react";
import { connect } from "react-redux";
import { storage } from "utils/storage";
import {
  reSendMail,
  confirmMail,
  geetestInit,
  geetestCount,
} from "service/http/http";
import history from "router/history";
import { message, Input, Button } from "antd";
import { Loadding } from "components/loadding";
import messageError from "utils/errorCode";
import gt from "utils/gt";
import { geetestValidatePackage } from "utils";
import VerificationIcon from "assets/image/verification-email.svg";
import BottomComponent from "components/bottomCpmonent/index";
import "./index.scss";
import { FormattedMessage } from "react-intl";
import { setTfaList } from "store/actions/publicAction";
import { onRecaptchaVerify, RECAPTCHA_SCRIPT_LOAD } from "@opnx-pkg/uikit";
import pubsub from "pubsub-js";

type VerificationState = {
  timing: number | string;
  restEmail: boolean;
  stateHistory: { email: string; type: string; psd?: string; code?: string };
  messageError: string;
  status: number;
  disabled: boolean;
  value: string;
  geetestType: string;
  recaptchaJs: boolean;
};
type IVerifyProps = ReturnType<typeof mapDispatchToProps>;
let time: any;
let off = true;
class Verification extends Component<IVerifyProps, VerificationState> {
  private timer: any;
  private unListenr: any;
  constructor(props: IVerifyProps) {
    super(props);
    this.state = {
      timing: 0,
      restEmail: false,
      stateHistory: { email: "1724321346@qq.com", type: "REGISTERED" },
      messageError: "",
      status: 0,
      disabled: true,
      value: "",
      geetestType: "RESEND_EMAIL",
      recaptchaJs: false,
    };
  }
  componentDidMount() {
    const state = history.location.state! as { email: string; type: string };
    const pathArr = decodeURIComponent(
      history.location.search.substring(1)
    ).split("&");
    const pathObj = {} as any;
    pathArr.forEach((item) => {
      const v = item.split("=");
      pathObj[v[0]] = v[1];
    });
    if (state || pathObj.email) {
      state && this.setState({ stateHistory: state });
      pathObj.email &&
        this.setState(
          {
            stateHistory: {
              email: pathObj.email,
              type: pathObj.type,
            },
            value: pathObj.code,
            disabled: false,
          },
          () => {
            this.unListenr = pubsub.subscribe(
              RECAPTCHA_SCRIPT_LOAD.EVENT,
              (target, value) => {
                if (value === RECAPTCHA_SCRIPT_LOAD.COMPLETED) {
                  this.submit();
                }
              }
            );
          }
        );
      // https://kiwi.OPNX.pro/user/verification?type=FORGOT_PWD_CONSOLE&email=bin.liang%40OPNX.com&code=183522
    } else {
      window.location.href = "/login";
      // history.replace("/login");
    }
    if (storage.get("Timing") === "") {
      time = 120;
      storage.set("Timing", 120);
      this.setState({ timing: time, restEmail: true });
    }
    if (storage.get("Timing") !== 0) {
      time = storage.get("Timing");
      this.setState({ timing: time, restEmail: true });
      this.timerCount();
    }
  }
  timerCount = () => {
    this.timer = setInterval(() => {
      time--;
      this.setState({ timing: time });
      storage.set("Timing", time);
      if (time === 0) {
        clearInterval(this.timer);
        this.setState({ restEmail: false, timing: 120 });
        storage.set("Timing", 0);
        time = 120;
        off = true;
      } else if (time < 0) {
        clearInterval(this.timer);
        this.setState({ restEmail: false, timing: 120 });
        storage.set("Timing", 0);
        time = 120;
        off = true;
      }
    }, 1000);
  };
  // handler = (obj: any) => {
  //   const that = this;
  //   const data = {
  //     email: this.state.stateHistory.email,
  //     geetestType: this.state.geetestType,
  //   };
  //   geetestValidatePackage(
  //     obj,
  //     data,
  //     () => {
  //       that.setState({ status: 1 });
  //       if (this.state.geetestType === "RESEND_EMAIL") {
  //         reSendMail(
  //           that.state.stateHistory.email,
  //           that.state.stateHistory.type
  //         )
  //           .then((res) => {
  //             if (res.code === "0000") {
  //               off = false;
  //               time = 120;
  //               that.timerCount();
  //               that.setState({ status: 0, restEmail: true });
  //               storage.set("Timing", time);
  //             } else {
  //               message.error(res.message);
  //             }
  //             that.setState({ status: 0 });
  //           })
  //           .catch((error) => that.setState({ status: 0 }));
  //       } else {
  //         this.confim();
  //       }
  //     },
  //     () => {
  //       that.setState({ status: 0 });
  //       off = true;
  //     }
  //   );
  // };
  rsSend = () => {
    const that = this;
    if (off) {
      off = false;
      if (!this.state.restEmail) {
        onRecaptchaVerify(
          "",
          "RESEND_EMAIL",
          (token, action) => {
            reSendMail(
              that.state.stateHistory.email,
              that.state.stateHistory.type,
              token,
              action
            )
              .then((res) => {
                if (res.code === "0000") {
                  off = false;
                  time = 120;
                  that.timerCount();
                  that.setState({ status: 0, restEmail: true });
                  storage.set("Timing", time);
                } else {
                  message.error(res.message);
                }
                that.setState({ status: 0 });
              })
              .catch((error) => that.setState({ status: 0 }));
          },
          () => that.setState({ status: 0 })
        );
      }
    }
  };
  // gtInit = () => {
  //   geetestInit(this.state.stateHistory.email).then((data: any) => {
  //     gt.initGeetest(
  //       {
  //         gt: data.gt,
  //         challenge: data.challenge,
  //         offline: !data.success, // 表示用户后台检测极验服务器是否宕机
  //         new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机
  //         product: "bind", // 产品形式，包括：float，popup
  //         lang: "en",
  //         width: "300px",
  //         https: true,
  //       },
  //       this.handler
  //     );
  //   });
  // };
  input = (e: any) => {
    this.setState({ value: e.target.value });
    if (e.target.value.length === 6) {
      this.setState({ disabled: false });
    } else {
      this.setState({ disabled: true, messageError: "" });
    }
  };
  confim = (token: string, action: string) => {
    const value = this.state.value;
    const stateHistory = this.state.stateHistory;
    stateHistory.code = value;
    const data = {
      confirmType: "EMAIL",
      emailType: stateHistory.type,
      confirmValue: stateHistory.email,
      confirmCode: value,
    };
    confirmMail(data, token, action)
      .then((res) => {
        if (res.code === "0000") {
          if (stateHistory.type === "REGISTERED") {
            window.location.href = "/login";
            // history.replace({
            //   pathname: "/login",
            //   state: stateHistory
            // });
          } else {
            this.props.setTfaList(res.data.tfaTypes || []);
            history.replace({
              pathname: "/resetpassword",
              state: { ...stateHistory, auth: res.data.tfaTypes },
            });
          }
        } else {
          this.setState({ messageError: res.message });
        }
        this.setState({ status: 0 });
      })
      .catch((err) => {
        this.setState({
          status: 0,
          messageError: messageError(err.code),
        });
      });
  };
  submit = () => {
    try {
      const value = this.state.value;
      const stateHistory = this.state.stateHistory;
      if (value.length === 6) {
        this.setState({ status: 1 });
        stateHistory.code = value;
        onRecaptchaVerify(
          "",
          "CONFIRM_EMAIL",
          (token, action) => {
            this.confim(token, action);
          },
          (err) => {
            this.setState({ status: 0 });
            off = true;
            console.log(err, "err");
          }
        );
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  componentWillUnmount() {
    pubsub.unsubscribe(this.unListenr);
    clearInterval(this.timer);
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const { timing, restEmail, messageError, stateHistory, status, disabled } =
      this.state;
    return (
      <div className="verification">
        <div className="verification-content">
          <Loadding show={status} style={{ backgroundColor: "#FFFFFF" }}>
            <div className="verification-content-top">
              <div className="verification-content-top-title1">
                {stateHistory.type === "FORGOT_PWD_CONSOLE" ? (
                  <FormattedMessage id="Password_Reset" />
                ) : (
                  <FormattedMessage id="Verify_your_email" />
                )}
              </div>
            </div>
            <div className="verification-container">
              <img src={VerificationIcon} alt="email" />
              <div className="verification-container-right">
                <FormattedMessage id="MailVerification_content1" />
                <span style={{ width: "100%", overflowWrap: "anywhere" }}>
                  {stateHistory.email}
                </span>{" "}
                {/* <FormattedMessage id="MailVerification_content2" /> */}
              </div>
            </div>
            <div className="verification-content-bottom">
              <div className="verification-content-bottom-title">
                <FormattedMessage id="Verification_Code" />
              </div>
              <Input
                onChange={this.input}
                type="number"
                autoFocus
                value={this.state.value}
              />
              <p
                style={{
                  marginTop: "6px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#E50000",
                }}
              >
                {messageError}
              </p>
              <Button type="primary" disabled={disabled} onClick={this.submit}>
                <FormattedMessage id="Submit" />
              </Button>
              <div className="verification-content-bottom-title2">
                <FormattedMessage id="MailVerification_content3" />
              </div>
              <div className="verification-content-bottom-title3">
                <p>
                  - <FormattedMessage id="MailVerification_content4" />
                </p>
                <p>
                  - <FormattedMessage id="MailVerification_content5" />
                </p>
                {/* <p>
                  - <FormattedMessage id="MailVerification_content6" />
                </p> */}
              </div>
              <div
                className="verification-content-bottom-resend-email"
                style={{ color: restEmail ? "#666666" : "" }}
                onClick={this.rsSend}
              >
                <FormattedMessage id="Resend_email" />
                {restEmail ? " (" + timing + "S)" : ""}
              </div>
            </div>
          </Loadding>
        </div>
        {stateHistory.type !== "FORGOT_PWD_CONSOLE" ? (
          <BottomComponent />
        ) : // <div className='verification-bottom'>
        //   <div className='verification-bottom-content'>
        //     <p>
        //       Prohibited Countries: American citizens and residents of the
        //       United States of America, Cuba, Iran, Syria, Sudan, North Korea,
        //       Afghanistan and any other{" "}
        //       <span
        //         style={{ color: "rgb(145, 32, 251)", cursor: "pointer" }}
        //         onClick={() => {
        //           window.open("https://OPNX.com/terms-of-service/");
        //         }}>
        //         Countries that are restricted from trading
        //       </span>{" "}
        //       on our platform are prohibited from holding positions or
        //       entering contracts at OPNX.
        //     </p>
        //     <p>
        //       If it is determined that any OPNX trading participant has
        //       given false representations as to their location or place of
        //       residence, OPNX reserves the right to close any of their
        //       accounts and to liquidate any open positions.
        //     </p>
        //   </div>
        // </div>
        null}
      </div>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setTfaList(data: string[]) {
      dispatch(setTfaList(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Verification);
