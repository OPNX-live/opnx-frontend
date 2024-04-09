import React, { Component } from "react";
import { connect } from "react-redux";
import { storage } from "utils/storage";
import { GetRequest } from "./data";
import { confirmMail } from "service/http/http";
import history from "router/history";
import "./verifyaccount.scss";
import { Loadding } from "components/loadding";
import { FormattedMessage } from "react-intl";
import { LOGIN } from "config";
import { onRecaptchaVerify, RECAPTCHA_SCRIPT_LOAD } from "@opnx-pkg/uikit";
import pubsub from "pubsub-js";
type IVerifyAccountPropsState = ReturnType<typeof mapStateToProps>;
type IVerifyAccountDispatchState = ReturnType<typeof mapDispatchToProps>;
class VerifyAccount extends Component {
  private unListenr: any;
  componentDidMount() {
    try {
      if (GetRequest()) {
        const data: any = GetRequest();
        data.confirmationToken = data.confirmationToken.replace(/%3D/g, "=");
        const sendData = {
          confirmType: "TOKEN",
          emailType: data.event,
          confirmValue: data.confirmationToken,
          confirmCode: data.confirmationCode,
        };
        this.unListenr = pubsub.subscribe(
          RECAPTCHA_SCRIPT_LOAD.EVENT,
          (target, value) => {
            if (value === RECAPTCHA_SCRIPT_LOAD.COMPLETED) {
              onRecaptchaVerify(
                "",
                "REGISTERED",
                (token, action) => {
                  confirmMail(sendData, token, action).then((res) => {
                    if (res && res.code === "0000") {
                      if (data.event === "REGISTERED") {
                        window.location.href = LOGIN;
                      } else {
                        history.replace({
                          pathname: "/resetpassword",
                          state: {
                            email: res.data,
                            type: data.type,
                            code: data.confirmationCode,
                          },
                        });
                      }
                    } else {
                      storage.set("Timing", "");
                      history.replace({
                        pathname: "/ErrorVerfiy",
                        state: { email: res.data, type: data.event },
                      });
                    }
                  });
                },
                (error) => {
                  console.log(error, "error");
                }
              );
            }
          }
        );
      } else {
        window.location.href = "/login";
        // history.replace('/login');
      }
    } catch (error) {
      console.log(error, "error");
    }
  }
  componentWillUnmount() {
    pubsub.unsubscribe(this.unListenr);
  }
  render() {
    return (
      <div className="VerifyAccount">
        <Loadding show={1}></Loadding>
        <p className="VerifyAccount-p">
          <FormattedMessage id="Verify_your_email" />
        </p>
      </div>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyAccount);
