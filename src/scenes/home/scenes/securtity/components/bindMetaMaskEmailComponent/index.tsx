import React, { useCallback, useEffect, useState, memo } from "react";
import { Row, Col, Form, Button, Modal, message } from "antd";
import { connect } from "react-redux";
import gt from "utils/gt";
import messageError from "utils/errorCode";
import {
  setMateMaskAddress,
  setDashboardUserData,
} from "store/actions/publicAction";
import {
  sendMail,
  UserData,
  geetestInit,
  geetestValidate,
  bindMetaMaskEmail,
} from "service/http/http";
import { localStorage } from "utils/storage";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import "./index.scss";
import BindMetaMaskEmailModal from "../bindMetaMaskEmailModal/index";
import BindMetaMaskEmailVerify from "../bindMetaMaskEmailVerify/index";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
// import AddressManagementComponent from "../addressManagementComponent";
type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = { setIsWhitetfa: Function };
type TProps = TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps;

const BindMetaMaskEmailComponent = memo((IProps: TProps) => {
  const [form] = Form.useForm();
  // const { SwitchLanguage, dashboardUserData, users, intl, setIsWhitetfa } = IProps;
  const {
    SwitchLanguage,
    dashboardUserData,
    users,
    intl,
    setDashboardUserData,
  } = IProps;
  const [loading, setLoading] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const [isShow, setIsShow] = useState(false);
  const [emailVerifyCode, setEmailVerifyCode] = useState(false);
  const [bindEmailFail, setBindEmailFail] = useState(false);
  // const [bindEmailFailText, setBindEmailFailText] = useState("");
  const [addressIsBind, setAddressIsBind] = useState(false);

  const [bindEmailFrom, setBindEmailFrom] = useState(form);

  const [sendEmailModalData, setSendEmailModalData] = useState({
    email: "",
    type: "BIND_EMAIL",
  });
  const [sendEmailType, setSendEmailType] = useState({
    email: "",
    geetestType: "BIND_EMAIL",
  });

  // setWhiteListModal emailCode

  const handleCancel = useCallback(() => {
    setIsShow(false);
    setEmailVerifyCode(false);
  }, []);

  const openBindEmailModal = useCallback((open: boolean) => {
    setEmailVerifyCode(false);
    setIsShow(open);
  }, []);

  const openBindEmailCodeModal = useCallback(
    (open: boolean) => {
      setIsShow(false);
      if (open) {
        setSendEmailModalData({
          ...sendEmailModalData,
          email: emailValue,
        });
        setSendEmailType({
          ...sendEmailType,
          email: emailValue,
        });
      }

      setEmailVerifyCode(open);
    },
    [emailValue, sendEmailModalData, sendEmailType]
  );

  const initGeetestHandler = useCallback(
    (captchaObj: any) => {
      captchaObj.appendTo("#captcha");

      const email = emailValue;
      if (email) {
        captchaObj
          .onReady(function () {
            captchaObj.verify();
            setLoading(false);
          })
          .onSuccess(() => {
            const result = captchaObj.getValidate();
            const data = {
              email: email, // bindEmail.email,
              geetest_challenge: result.geetest_challenge,
              geetest_validate: result.geetest_validate,
              geetest_seccode: result.geetest_seccode,
              clientType: "web",
              geetestType: "SEND_EMAIL",
            };
            geetestValidate(data)
              .then((resGeestest: any) => {
                if (resGeestest.status === "success") {
                  sendMail(email, sendEmailModalData.type, "").then((res) => {
                    if (
                      res &&
                      res.code === "0000" &&
                      res.data &&
                      res.event === "SEND_EMAIL"
                    ) {
                      openBindEmailCodeModal(true);
                      localStorage.set("timingdown", 120);
                      localStorage.set("metamaskbindemail", email);
                    } else if (res.code === "45014") {
                      setBindEmailFail(true);
                      // message.error(res.message);
                    } else {
                      message.error(
                        intl.formatMessage({
                          id: "MetaMask send email validation failed",
                        })
                      );
                    }
                    setLoading(false);
                  });
                } else {
                  captchaObj.reset();
                  setLoading(false);
                }
              })
              .catch((err) => {
                captchaObj.reset();
                setLoading(false);
              });
          })
          .onClose(() => {
            setLoading(false);
          });
      }
    },
    [emailValue, intl, openBindEmailCodeModal, sendEmailModalData.type]
  );

  const bindEmailData = useCallback(
    (params: any) => {
      setLoading(true);
      const email = params.email;
      // const password = params.password;
      // const confirmPassword = params.confirmPassword;

      const emailVal = email ? email.replace(/\s+/g, "") : "";
      // const passwordVal = password ? password.replace(/\s+/g, "") : "";
      // const confirmPasswordVal = confirmPassword ? confirmPassword.replace(/\s+/g, "") : "";

      // console.log("bindEmailData emailVal, passwordVal, confirmPasswordVal: ", emailVal, passwordVal, confirmPasswordVal);

      if (users) {
        onRecaptchaVerify(
          "",
          "SEND_EMAIL",
          (token, action) => {
            sendMail(email, sendEmailModalData.type, "", token, action).then(
              (res) => {
                if (
                  res &&
                  res.code === "0000" &&
                  res.data &&
                  res.event === "SEND_EMAIL"
                ) {
                  openBindEmailCodeModal(true);
                  localStorage.set("timingdown", 120);
                  localStorage.set("metamaskbindemail", email);
                } else if (res.code === "45014") {
                  setBindEmailFail(true);
                  // message.error(res.message);
                } else {
                  message.error(
                    intl.formatMessage({
                      id: "MetaMask send email validation failed",
                    })
                  );
                }
                setLoading(false);
              }
            );
          },
          () => setLoading(false)
        );
      }
    },
    [users, sendEmailModalData.type, openBindEmailCodeModal, intl]
  );

  const bindEmailonFinish = useCallback(
    async (emailCode) => {
      setEmailVerifyCode(false);

      const response = await bindMetaMaskEmail(
        emailValue,
        passwordValue,
        confirmPasswordValue
      );

      if (response && response.success) {
        message.success(intl.formatMessage({ id: "Bind Success" }));
        setIsShow(false);
        UserData().then((res) => {
          if (res.code === "0000") {
            setDashboardUserData(res.data);
          } else {
            message.error(res.message);
          }
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        });
      } else {
        setBindEmailFail(true);
      }
    },
    [
      emailValue,
      passwordValue,
      confirmPasswordValue,
      intl,
      setDashboardUserData,
    ]
  );

  const bindEvent = useCallback(async () => {
    setIsShow(true);
    //  const res = validateEmailIsBindMetaMask(mateMaskSelectedAddress);
    localStorage.set("timingdown", "");
    localStorage.set("metamaskbindemail", "");
  }, []);

  useEffect(() => {
    if (dashboardUserData) {
      if (
        dashboardUserData.publicAddress &&
        dashboardUserData.accountSource === "METAMASK" &&
        dashboardUserData.bindEmail
      ) {
        setAddressIsBind(true);
      } else {
        const isBindEmail = localStorage.getValue("metamaskbindemail");
        const timeDown = localStorage.getValue("timingdown");
        if (isBindEmail && timeDown && emailValue && passwordValue) {
          // setEmailVerifyCode(true);
        }
      }
    }
  }, [
    dashboardUserData,
    dashboardUserData.publicAddress,
    emailValue,
    passwordValue,
  ]);

  return (
    <div className={"metamask-email-bind-page"}>
      <Row gutter={[8, 0]}>
        <Col xs={{ span: 24 }} lg={{ span: 12 }}>
          <div className="metamask-email-bind-cart">
            <div className="cart-item" style={{ height: "60px" }}>
              <div className="title">
                {" "}
                {intl.formatMessage({
                  id: "Email",
                  defaultMessage: "Email",
                })}
              </div>
              {users.mainLogin ? (
                <Button
                  className={`${addressIsBind ? "" : "active"}`}
                  onClick={bindEvent}
                >
                  {intl.formatMessage({
                    id: "Bind",
                    defaultMessage: "Bind",
                  })}
                </Button>
              ) : null}
            </div>
            {/*<div className="cart-item-line"></div>
            <AddressManagementComponent setIsWhitetfa={setIsWhitetfa} />*/}
          </div>
        </Col>
      </Row>
      {isShow && (
        <Modal
          className="matemask-bind-you-email"
          title={""}
          footer={null}
          visible={isShow}
          width={388}
          onCancel={handleCancel}
          destroyOnClose={true}
          maskClosable={false}
        >
          <BindMetaMaskEmailModal
            loading={loading}
            setEmailValue={setEmailValue}
            setPasswordValue={setPasswordValue}
            setConfirmPasswordValue={setConfirmPasswordValue}
            bindEmailFrom={bindEmailFrom}
            setBindEmailFrom={setBindEmailFrom}
            bindEmailData={bindEmailData}
            defaultData={{
              email: emailValue,
              password: passwordValue,
              confirmPassword: confirmPasswordValue,
            }}
          />
        </Modal>
      )}
      {emailVerifyCode && (
        <Modal
          className="matemask-bind-email-code"
          title={""}
          footer={null}
          visible={emailVerifyCode}
          width={388}
          onCancel={handleCancel}
          maskClosable={false}
          destroyOnClose={true}
        >
          <BindMetaMaskEmailVerify
            loading={loading}
            openBindEmailModal={openBindEmailModal}
            openBindEmailCodeModal={openBindEmailCodeModal}
            setLoading={setLoading}
            setBindEmailFail={setBindEmailFail}
            bindEmailonFinish={bindEmailonFinish}
            sendEmailModalData={sendEmailModalData}
            defaultData={{
              email: emailValue,
              password: passwordValue,
              confirmPassword: confirmPasswordValue,
            }}
          />
        </Modal>
      )}
      {bindEmailFail && (
        <Modal
          title={""}
          visible={bindEmailFail}
          footer={null}
          width={480}
          destroyOnClose={false}
          maskClosable={true}
          className="metamask-bind-email-failed"
          onCancel={() => {
            setBindEmailFail(false);
          }}
        >
          <div className="metamask-bind-failed-content">
            <div className="metamask-bind-email-failed-title">
              <FormattedMessage id="Bind Failed" />
            </div>
            <div className="metamask-bind-email-failed-text">
              <FormattedMessage
                id="Please use another email address."
                defaultMessage="Please use another email address."
              />
            </div>
          </div>
          <div className="metamask-bind-email-failed-btn">
            <Button
              type="primary"
              onClick={() => {
                setBindEmailFail(false);
              }}
            >
              <FormattedMessage id="Confirm" />
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
});

const mapStateToProps = (state: IGlobalT) => ({
  dashboardUserData: state.dashboardUserData,
  users: state.users,
  SwitchLanguage: state.SwitchLanguage,
  mateMaskSelectedAddress: state.mateMaskSelectedAddress,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setMateMaskAddress(data: string) {
      dispatch(setMateMaskAddress(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BindMetaMaskEmailComponent));
