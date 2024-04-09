import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button, message, Spin } from "antd";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./addreddWhileVerify.scss";
import {
  geetestInit,
  geetestValidate,
  whiteListSendMail,
} from "service/http/http";
import gt from "utils/gt";
import { LoadingOutlined } from "@ant-design/icons";
import { localStorage, messageError } from "utils";
import TfaListVerify from "../tfaListVerify/tfaListVerify";
import isAddress from "utils/isAddress";
import { addressTruncator } from "utils/addressTruncator";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
let timer: any;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: (success: string, emailCode: string, type?: string) => void;
  type?: string;
  btnLoading?: number;
}
interface ItfaProps {
  dashboardUserData: IDashboardUserData;
  SwitchLanguage: string;
  users: Iusers;
}
// enum EunmTfaType {
//   AUTHY_SECRET = "Authy",
//   AUTHY_PHONE = "Authy",
//   GOOGLE = "GoogleAuth",
//   YUBIKEY = "YubiKey",
// }
function AddreddWhileVerify(
  props: ItfaValidationProps & ItfaProps & WrappedComponentProps
) {
  // const [loading, setLoading] = useState<boolean>(false);
  const count = new Date().getTime() - Number(localStorage.get("time"));
  const [tfaInpunt, setTfaInpot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sendEamil, setSendEamil] = useState(true);
  const [emailCode, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [nowTime, setNowTime] = useState(
    localStorage.get("time") && ~~(count / 1000) < 120
      ? ~~(120 - count / 1000)
      : 0
  );
  const name = useMemo(() => {
    if (!props.users) {
      return "";
    }
    if (
      props.dashboardUserData &&
      props.dashboardUserData.accountSource === "METAMASK"
    ) {
      if (!props.dashboardUserData.bindEmail) {
        if (props.dashboardUserData.isMainAccount) {
          return `${props.dashboardUserData.accountName.slice(
            0,
            6
          )}...${props.dashboardUserData.accountName.slice(-4)}`;
        } else {
          return `${props.dashboardUserData.loginName.slice(
            0,
            6
          )}...${props.dashboardUserData.loginName.slice(-4)}/${
            props.dashboardUserData.accountName.length > 4
              ? props.dashboardUserData.accountName.slice(0, 4) + "..."
              : props.dashboardUserData.accountName
          }`;
        }
      } else {
        if (props.dashboardUserData.isMainAccount) {
          return `${props.dashboardUserData.bindEmail
            .split("@")[0]
            .slice(0, 2)}***@${
            props.dashboardUserData.bindEmail.split("@")[1]
          }`;
        } else {
          return `${props.dashboardUserData.bindEmail
            .split("@")[0]
            .slice(0, 2)}***@${
            props.dashboardUserData.bindEmail.split("@")[1]
          }/${
            props.dashboardUserData.accountName.length > 4
              ? props.dashboardUserData.accountName.slice(0, 4) + "..."
              : props.dashboardUserData.accountName
          }`;
        }
      }
    } else if (isAddress(props.users.email)) {
      return addressTruncator(props.users.email);
    } else if (props.users.mainLogin) {
      return props.users.accountName === props.users.email
        ? props.users.email.split("@")[0].slice(0, 2) +
            "***@" +
            props.users.email.split("@")[1]
        : props.users.email.split("@")[0].slice(0, 2) +
            "***@" +
            props.users.email.split("@")[1] +
            "/" +
            (props.users.accountName.length > 4
              ? props.users.accountName.slice(0, 4) + "..."
              : props.users.accountName);
    } else {
      return props.users.email.indexOf("@") !== -1
        ? props.users.email.split("@")[0].slice(0, 2) +
            "***@" +
            props.users.email.split("@")[1]
        : props.users.email.length > 7
        ? props.users.email.slice(0, 4) + "***" + props.users.email.slice(-4)
        : props.users.email +
          (props.users.accountName.length > 4
            ? props.users.accountName.slice(0, 4) + "..."
            : props.users.accountName);
    }
  }, [props.users, props.dashboardUserData]);

  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const submit = () => {
    props.callBack(tfaInpunt, emailCode, props.type);
  };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  useEffect(() => {
    if (nowTime !== 0) {
      intervalTime(nowTime);
    }
    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (tfaInpunt.length === 52 && emailCode.length === 6) {
      submit();
    }
  }, [tfaInpunt, emailCode]);
  const getEmailCode = (token: string, action: string) => {
    whiteListSendMail(token, action).then((res) => {
      setLoading(false);
      if (res.success) {
        setSendEamil(true);
        setNowTime(120);
        setTime("119 s");
        intervalTime(120);
        localStorage.set("time", new Date().getTime());
      } else {
        message.warning(res.message);
      }
    });
  };
  const sendEmail = () => {
    setLoading(true);
    if (sendEamil) {
      setSendEamil(false);
      onRecaptchaVerify(
        "",
        "SEND_EMAIL",
        (token, action) => {
          setLoading(false);
          getEmailCode(token, action);
        },
        () => setLoading(false)
      );
    }
  };
  const intervalTime = (nowTi: number) => {
    timer = setInterval(() => {
      if (nowTi > 1) {
        nowTi--;
        setNowTime(~~(nowTi - 1));
        setTime(~~(nowTi - 1) + " s");
      } else {
        setTime("");
        clearInterval(timer);
        localStorage.set("time", 0);
      }
    }, 1000);
  };

  // const handler = (obj: any) => {
  //   setLoading(true);
  //   obj.appendTo("#captcha");
  //   obj
  //     .onReady(function () {
  //       obj.verify();
  //     })
  //     .onSuccess(() => {
  //       const result = obj.getValidate();
  //       const data = {
  //         email: props.dashboardUserData.bindEmail,
  //         geetest_challenge: result.geetest_challenge,
  //         geetest_validate: result.geetest_validate,
  //         geetest_seccode: result.geetest_seccode,
  //         clientType: "web",
  //         geetestType: "SEND_EMAIL",
  //       };
  //       geetestValidate(data)
  //         .then((resGeestest: any) => {
  //           if (resGeestest.status === "success") {
  //             getEmailCode();
  //           } else {
  //             setLoading(false);
  //             setSendEamil(true);
  //             message.warning(
  //               props.intl.formatMessage({
  //                 id: "VerificationFailed",
  //                 defaultMessage: "Verification failed, please try again",
  //               })
  //             );
  //             obj.reset();
  //           }
  //         })
  //         .catch((err) => {
  //           setLoading(false);
  //           setSendEamil(true);
  //           message.warning(
  //             props.intl.formatMessage({
  //               id: "VerificationFailed",
  //               defaultMessage: "Verification failed, please try again",
  //             })
  //           );
  //           obj.reset();
  //         });
  //     })
  //     .onClose(() => {
  //       setLoading(false);
  //       setSendEamil(true);
  //       message.warning(
  //         props.intl.formatMessage({
  //           id: "VerificationFailed",
  //           defaultMessage: "Verification failed, please try again",
  //         })
  //       );
  //     });
  // };
  const onCallback = (e: string) => {
    setTfaInpot(e);
  };
  return (
    <Modal
      className="address-ver-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
      title="Security verification"
    >
      <div className="tfa">
        <div className="tfa-input">
          <div className="tfa-way">
            {props.intl.formatMessage({
              id: "E-mail verification code",
              defaultMessage: "E-mail verification code",
            })}
          </div>
          <Input
            // onPressEnter={submit}
            autoFocus
            suffix={
              time ? (
                <span style={{ color: "#539EF7 " }}>{time}</span>
              ) : (
                <Spin spinning={loading} indicator={antIcon}>
                  <span className="click-code" onClick={sendEmail}>
                    {props.intl.formatMessage({
                      id: "Click to get code",
                      defaultMessage: "Click to get code",
                    })}
                  </span>
                </Spin>
              )
            }
            onChange={onEmailChange}
          />
        </div>
        <div className="remined">
          {props.intl.formatMessage({
            id: "Enter the 6 digit code received by ",
            defaultMessage: `Enter the 6 digit code received by `,
          })}
          {""}
          {name}
        </div>
        <div className="tfa-input">
          <TfaListVerify onCallback={onCallback} />
          {/* <div className="tfa-way">
            {props.intl.formatMessage({
              id: tfaType[props.dashboardUserData.tfaType],
            })}
          </div>
          <Input
            placeholder={props.intl.formatMessage({
              id: tfaType[props.dashboardUserData.tfaType],
            })}
            // onPressEnter={submit}
            autoFocus
            onChange={onChange}
          /> */}
        </div>
        <Button
          size="large"
          onClick={submit}
          loading={props.btnLoading ? true : false}
          type="primary"
          disabled={emailCode && tfaInpunt ? false : true}
        >
          {props.intl.formatMessage({
            id: "Verify",
          })}
        </Button>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: ItfaProps) => {
  return {
    dashboardUserData: state.dashboardUserData,
    SwitchLanguage: state.SwitchLanguage,
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AddreddWhileVerify));
