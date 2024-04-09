import React, { useCallback, useState, memo, useEffect } from "react";
import { connect } from "react-redux";
import { message, Form, Input, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import { localStorage } from "utils/storage";
import {
  sendMail,
  sendMetamaskBindonfirmMail,
  geetestCount,
  geetestInit,
} from "service/http/http";
import { geetestValidatePackage } from "utils";
import gt from "utils/gt";
import messageError from "utils/errorCode";
import VerificationIcon from "assets/image/verification-email.svg";
import { setMateMaskAddress } from "store/actions/publicAction";

import "./index.scss";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 0, span: 24 },
};

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = {
  loading: boolean;
  openBindEmailCodeModal: Function;
  setLoading: Function;
  bindEmailonFinish: Function;
  setBindEmailFail: Function;
  sendEmailModalData: any;
  openBindEmailModal: Function;
  defaultData: any;
};
type TProps = TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps;
/*
 loading={loading}
          openBindEmailCodeModal={openBindEmailCodeModal}
          setLoading={setLoading}
          setEmailCodeValue={setEmailCodeValue}
          bindEmailonFinish={bindEmailonFinish}
          defaultData
*/
const BindMetaMaskEmailVerify = memo((IProps: TProps) => {
  const [form] = Form.useForm();
  const {
    intl,
    defaultData,
    openBindEmailModal,
    loading,
    setLoading,
    bindEmailonFinish,
    openBindEmailCodeModal,
    sendEmailModalData,
    setBindEmailFail,
  } = IProps;
  const [restEmail, setRestEmail] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [timingDown, setTimingDown] = useState(0);
  const [timer, setTimer] = useState(0);
  const [emailcode, setEmailCode] = useState("");

  const timerCount = useCallback(() => {
    let time = Number(localStorage.get("timingdown"));
    time = time - 1;
    if (time <= 0) {
      setRestEmail(false);
      time = 120;
    }

    setTimingDown(time);

    localStorage.set("timingdown", time);
    return timer;
  }, [timer]);
  /*

  */
  useEffect(() => {
    let time = Number(localStorage.get("timingdown"));
    if (time > 0 && restEmail) {
      setTimeout(() => {
        setTimer(timerCount());
      }, 1200);
    } else {
      clearTimeout(timer);
    }
  }, [timerCount, timer, restEmail]);

  const handleEmailCode = useCallback(
    async (token: string, action: string) => {
      const data = {
        confirmType: "EMAIL",
        emailType: "BIND_EMAIL",
        confirmValue: defaultData.email,
        confirmCode: emailcode,
      };
      const response = await sendMetamaskBindonfirmMail(data, token, action);

      if (response && response.code === "0000" && response.success) {
        bindEmailonFinish(emailcode);
        openBindEmailModal(true);
        localStorage.set("timingdown", 0);
        localStorage.set("metamaskbindemail", "");
      } else {
        setLoading(false);
        setBtnDisabled(false);
        message.error(messageError(response.code));
      }
      // setLoading(false);
    },
    [
      defaultData.email,
      emailcode,
      setLoading,
      bindEmailonFinish,
      openBindEmailModal,
    ]
  );
  // const handler = (obj: object, p: any) => {
  //   const data = {
  //     email: defaultData.email,
  //     geetestType: "BIND_EMAIL",
  //   };
  //   geetestValidatePackage(obj, data, async () => {
  //     handleEmailCode();
  //   });
  // };
  const gtInit = useCallback(() => {
    if (defaultData.email) {
      onRecaptchaVerify(
        "",
        "BIND_EMAIL",
        (token, action) => {
          handleEmailCode(token, action);
        },
        () => setLoading(false)
      );
    } else {
      setLoading(false);
      setBtnDisabled(false);
      message.error(intl.formatMessage({ id: "41013" }));
    }
  }, [defaultData.email, handleEmailCode, intl, setLoading]);

  // const geetVerify = useCallback(
  //   (val) => {
  //     const data = {
  //       confirmType: "EMAIL",
  //       emailType: "BIND_EMAIL",
  //       confirmValue: defaultData.email,
  //       confirmCode: val,
  //     };
  //     setLoading(true);
  //     // setBtnDisabled(true);
  //     geetestCount(data)
  //       .then((geetestRes) => {
  //         if (geetestRes.code === "0000") {
  //           handleEmailCode();
  //         } else {
  //           if (geetestRes.code === "45037") {
  //             // 如果后端返回这个code 要唤起geetest
  //             gtInit();
  //           } else {
  //             setLoading(false);
  //             setBtnDisabled(false);
  //             message.error(messageError(geetestRes.code));
  //           }
  //         }
  //       })
  //       .catch(() => {
  //         setLoading(false);
  //         setBtnDisabled(false);
  //       });
  //   },
  //   [defaultData.email, setLoading, handleEmailCode, gtInit]
  // );

  const onFinish = useCallback(async () => {
    const val = emailcode;

    if (val && val.length === 6) {
      gtInit();
    } else {
      setBtnDisabled(false);
      message.error(intl.formatMessage({ id: "25030" }));
    }
  }, [emailcode, gtInit, intl]);

  const codeChange = useCallback(
    (e: any) => {
      setEmailCode(e.target.value);

      if (e.target.value.length === 6) {
        setBtnDisabled(false);
      }
    },
    [setEmailCode]
  );

  const sendEmailHandler = useCallback(
    async (obj: any) => {
      geetestValidatePackage(
        obj,
        {
          // geetestType: sendEmailType.geetestType,
          email: defaultData.email,
        },
        () => {
          sendMail(defaultData.email, sendEmailModalData.type, "").then(
            (res) => {
              localStorage.set("timingdown", 120);
              if (res && res.code === "0000" && res.data) {
                setRestEmail(true);
                openBindEmailCodeModal(true);
                localStorage.set("metamaskbindemail", defaultData.email);
              } else if (res.code === "45014") {
                setBindEmailFail(true);
                setLoading(false);
                setRestEmail(false);
                // message.error(res.message);
              } else {
                setLoading(false);
                setBtnDisabled(false);
                message.error(
                  intl.formatMessage({
                    id: "MetaMask send email validation failed",
                  })
                );
              }
            }
          );
        },
        () => {
          setRestEmail(false);
          setLoading(false);
        }
      );
    },
    [
      defaultData,
      intl,
      openBindEmailCodeModal,
      sendEmailModalData.type,
      setBindEmailFail,
      setLoading,
    ]
  );

  const sendBindEmail = useCallback(() => {
    if (defaultData.email && !restEmail) {
      setRestEmail(true);
      onRecaptchaVerify(
        "",
        "SEND_EMAIL",
        (token, action) => {
          sendMail(
            defaultData.email,
            sendEmailModalData.type,
            "",
            token,
            action
          ).then((res) => {
            localStorage.set("timingdown", 120);
            if (res && res.code === "0000" && res.data) {
              setRestEmail(true);
              openBindEmailCodeModal(true);
              localStorage.set("metamaskbindemail", defaultData.email);
            } else if (res.code === "45014") {
              setBindEmailFail(true);
              setLoading(false);
              setRestEmail(false);
              // message.error(res.message);
            } else {
              setLoading(false);
              setBtnDisabled(false);
              message.error(
                intl.formatMessage({
                  id: "MetaMask send email validation failed",
                })
              );
            }
          });
        },
        () => {
          setRestEmail(false);
          setLoading(false);
        }
      );
    }
  }, [
    defaultData.email,
    intl,
    openBindEmailCodeModal,
    restEmail,
    sendEmailModalData.type,
    setBindEmailFail,
    setLoading,
  ]);

  return (
    <div className="metamask-bind-verification">
      <div className="metamask-bind-verification-content">
        <div className="metamask-bind-verification-content-top">
          <div className="metamask-bind-verification-content-top-title1">
            <ArrowLeftOutlined
              onClick={() => {
                openBindEmailModal(true);
              }}
            />
            <FormattedMessage id="Verify_your_email" />
          </div>
        </div>
        <Form
          name="verifyemailcode"
          form={form}
          {...layout}
          onFinish={onFinish}
          initialValues={{ remember: false }}
          hideRequiredMark={true}
        >
          <Form.Item
            {...tailLayout}
            className="matemask-bind-email-verify-form-item"
            validateFirst={false}
          >
            <div className="metamask-bind-verification-container-top">
              <img src={VerificationIcon} alt="email" />
              <div className="metamask-bind-verification-container-right">
                <FormattedMessage id="MailVerification_content1" />
                <span style={{ width: "100%", overflowWrap: "anywhere" }}>
                  {defaultData.email}
                </span>{" "}
              </div>
            </div>
          </Form.Item>
          <Form.Item
            {...tailLayout}
            className="matemask-bind-email-verify-form-item"
          >
            <div className="matemask-bind-verification-content-bottom-title">
              <FormattedMessage id="Verification_Code" />
            </div>
            <Input
              data-type="emailcode"
              onChange={codeChange}
              type="number"
              allowClear={true}
            />
          </Form.Item>
          <Form.Item {...tailLayout} className="matemask-bind-email-ant">
            <div className="matemask-bind-email-btn">
              <Button
                loading={loading}
                disabled={btnDisabled}
                type="primary"
                htmlType="submit"
              >
                {intl.formatMessage({ id: "Submit" })}
              </Button>
            </div>
          </Form.Item>
          <Form.Item {...tailLayout} className="matemask-bind-email-ant">
            <div className="metamask-bind-verification-content-bottom">
              <div className="metamask-bind-verification-content-bottom-title2">
                <FormattedMessage id="MailVerification_content3" />
              </div>
              <div className="metamask-bind-verification-content-bottom-title3">
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
            </div>
          </Form.Item>
          <Form.Item {...tailLayout} className="matemask-bind-email-ant">
            <div
              className="metamask-bind-verification-content-bottom-resend-email"
              style={{ color: restEmail ? "#666666" : "" }}
              onClick={sendBindEmail}
            >
              <FormattedMessage id="Resend_email" />
              {restEmail && Number(timingDown) > 0
                ? " (" + timingDown + "S)"
                : ""}
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
});

const mapStateToProps = (state: IGlobalT) => ({
  dashboardUserData: state.dashboardUserData,
  users: state.users,
  SwitchLanguage: state.SwitchLanguage,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setMateMaskAddress(data: string) {
      dispatch(setMateMaskAddress(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BindMetaMaskEmailVerify));
