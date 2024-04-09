import React, { useReducer, useEffect } from "react";
import { connect } from "react-redux";
import BottomComponent from "../../components/bottomCpmonent/index";
import { Form, Input, Button, message, Tabs } from "antd";
import gt from "../../utils/gt";
import {
  registerRequest,
  geetestInit,
  geetestValidate
} from "../../service/http/http";
import select from "../../assets/image/register-select.png";
import noSelect from "../../assets/image/register-not-selet.png";
import "./register.scss";
import history from "router/history";
import { storage } from "utils/storage";
import messageError from "utils/errorCode";
import PasswordVerify from "components/PasswordVerify/PasswordVerify";
// import { Login } from "router/configRouter";
import PwsPrompt from "components/PwsPrompt/PwsPrompt";
import LimitModal from "components/LimitModal/LimitModal";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";
import { switchLoginActiveTab } from "../../store/actions/publicAction";
import MetaMask from "../metaMask/Metamask";
import { HocIsUsModal } from "components/HocIsUsModal/HocIsUsModal";
const { TabPane } = Tabs;
// import MetaMask from "../metaMask/Metamask";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 20 }
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
};
interface IRegisterState {
  checked: boolean;
  password: string;
  loadding: boolean;
  lvl: number;
  shareAccountId: string | null;
  isFocus: boolean;
  limitModalVisinle: boolean;
}
type IRegisterPropsState = ReturnType<typeof mapStateToProps>;
type IRegisterDispatchState = ReturnType<typeof mapDispatchToProps>;

function Register(
  props: WrappedComponentProps & IRegisterPropsState & IRegisterDispatchState
) {
  const [form] = Form.useForm();

  const [register, registerDispatch] = useReducer(
    (state: IRegisterState, action: any) => {
      switch (action.type) {
        case "checked":
          return { ...state, checked: action.checked };
        case "password":
          return { ...state, password: action.password };
        case "loadding":
          return { ...state, loadding: action.loadding };
        case "lvl":
          return { ...state, lvl: action.lvl };
        case "shareAccountId":
          return { ...state, shareAccountId: action.shareAccountId };
        case "isFocus":
          return { ...state, isFocus: action.isFocus };
        case "limitModalVisinle":
          return { ...state, limitModalVisinle: action.limitModalVisinle };
        default:
          return state;
      }
    },
    {
      checked: false,
      password: "",
      loadding: false,
      lvl: 0,
      shareAccountId: null,
      isFocus: false,
      limitModalVisinle: false
    }
  );
  useEffect(() => {
    // Login.preload();
    window.location.search &&
      registerDispatch({
        type: "shareAccountId",
        shareAccountId: window.location.search.split("=")[1]
      });
  }, []);
  const captchaObj = (
    Email: string,
    password: string,
    confirmPassword: string,
    shareAccountId: string | null
  ) => {
    const handler = function (captchaObj: any) {
      captchaObj.appendTo("#captcha");
      registerDispatch({ type: "loadding", loadding: false });
      captchaObj
        .onReady(function () {
          captchaObj.verify();
          registerDispatch({ type: "loadding", loadding: false });
        })
        .onSuccess(() => {
          registerDispatch({ type: "loadding", loadding: true });
          const result = captchaObj.getValidate();
          const data = {
            email: Email,
            geetest_challenge: result.geetest_challenge,
            geetest_validate: result.geetest_validate,
            geetest_seccode: result.geetest_seccode,
            clientType: "web",
            geetestType: "REGISTER"
          };
          geetestValidate(data)
            .then((resGeestest: any) => {
              if (resGeestest.status === "success") {
                registerRequest(
                  Email.replace(/\s+/g, ""),
                  password.replace(/\s+/g, ""),
                  confirmPassword.replace(/\s+/g, ""),
                  shareAccountId
                )
                  .then((res) => {
                    if (res.success) {
                      storage.set("Timing", "");
                      history.push({
                        pathname: "/verification",
                        state: {
                          email: Email,
                          pad: password,
                          type: "REGISTERED"
                        }
                      });
                    } else {
                      registerDispatch({ type: "loadding", loadding: false });
                      if (res.code === "25011") {
                        registerDispatch({
                          type: "limitModalVisinle",
                          limitModalVisinle: true
                        });
                        return;
                      }
                      message.warning(res.message);
                    }
                  })
                  .catch((rn) => {
                    if (rn.status === 400) {
                      message.error("fail");
                    }
                  });
              } else {
                captchaObj.reset();
                registerDispatch({ type: "loadding", loadding: false });
              }
            })
            .catch((err) => {
              captchaObj.reset();
              registerDispatch({ type: "loadding", loadding: false });
            });
        })
        .onClose(() => {
          registerDispatch({ type: "loadding", loadding: false });
        });
    };
    geetestInit(Email).then((data: any) => {
      gt.initGeetest(
        {
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success, // 表示用户后台检测极验服务器是否宕机
          new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机
          product: "bind", // 产品形式，包括：float，popup
          lang: "en",
          width: "300px",
          https: true
        },
        handler
      );
    });
  };
  const onFinish = (e: any) => {
    const Email = e.Email.replace(/\s+/g, "");
    const Password = e.Password.replace(/\s+/g, "");
    const ConfirmPassword = e.ConfirmPassword.replace(/\s+/g, "");
    if (register.checked) {
      registerDispatch({ type: "loadding", loadding: true });
      captchaObj(Email, Password, ConfirmPassword, register.shareAccountId);
    } else {
      message.warning(
        props.intl.formatMessage({
          id: "PleaseAgreeTo",
          defaultMessage: "Please agree to the terms of service"
        })
      );
    }
  };
  const onFinishFailed = (e: any) => {
    if (register.checked) {
      return;
    }
    message.warning(
      props.intl.formatMessage({
        id: "PleaseAgreeTo",
        defaultMessage: "Please agree to the terms of service"
      })
    );
  };
  const onValuesChange = (value: any, values: any) => {
    if (values["Email"] && values["Password"]) {
      onPasswordStrong(values["Email"], values["Password"], "");
    }
  };
  const isCheck = (e: any) => {
    registerDispatch({ type: "checked", checked: !register.checked });
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type: string | undefined = e.currentTarget.dataset.type;
    const value: string = e.target.value;
    if (type === "Password") {
      registerDispatch({ type: "password", password: value });
    }
  };
  const handleConfirmPassword = (rule: any, value: any, callback: any) => {
    if (register.password.replace(/\s+/g, "") !== value.replace(/\s+/g, "")) {
      callback(
        props.intl.formatMessage({
          id: "45008",
          defaultMessage: "The passwords do not match , please re-enter"
        })
      );
      return;
    }
    callback();
  };
  const getLvl = (pwd: string) => {
    let lvl = 0;
    if (/[0-9]/.test(pwd)) {
      lvl++;
    }
    if (/[A-Z]/.test(pwd)) {
      lvl++;
    }
    if (/[a-z]/.test(pwd)) {
      lvl++;
    }
    if (/[`~!@#$%^&*()_+<>?:"{},./;'[\]\\]/.test(pwd)) {
      console.log(2222);
      lvl++;
    }
    return lvl;
  };
  const handlePassword = async (rule: any, value: any, callback: any) => {
    const re = /^[0-9a-zA-Z`~!@#$%^&*()_+<>?:"{},./;'[\]\\]*$/;
    if (!re.test(value)) {
      return Promise.reject(
        `Invalid symbols. Please use only${`\`~!@#$%^&*()_+<>?:"{},./;'[\\]`}`
      );
    }
    if (getLvl(value) === 1) {
      return Promise.reject(messageError("41002"));
    } else if (getLvl(value) === 2 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (getLvl(value) === 3 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (getLvl(value) === 4 && value.length >= 8) {
      return Promise.resolve();
    }
    const email = form.getFieldValue("Email");
    return email
      ? await onPasswordStrong(email, value, "pwd")
      : Promise.resolve();
  };
  const onPasswordStrong = async (
    email: string,
    password: string,
    type: string
  ) => {
    const arr = [];
    email?.split("").forEach((value, index) => {
      if (index < email.length - 6 + 1) {
        if (password.indexOf(email.slice(index, 6 + index)) !== -1) {
          arr.push(email.slice(index, 6 + index));
        }
      }
    });
    if (arr.length > 0) {
      if (type === "pwd") {
        return Promise.reject(
          props.intl.formatMessage({
            id: "DontUsePart",
            defaultMessage:
              "Don't use part of your login Email/name in your password."
          })
        );
      } else {
        form.setFields([
          {
            name: "Password",
            errors: [
              props.intl.formatMessage({
                id: "DontUsePart",
                defaultMessage:
                  "Don't use part of your login Email/name in your password."
              })
            ]
          }
        ]);
      }
    }
  };

  const tabsCallback = (key: string) => {
    props.switchLoginActiveTab(key);
  };

  const toLogin = () => {
    console.log("register toLogin");
    props.switchLoginActiveTab("login");
    history.push("/login");
  };

  useEffect(() => {
    if (!props.loginActiveTab) {
      props.switchLoginActiveTab("register");
    } else if (props.loginActiveTab.toLowerCase().indexOf("login") >= 0) {
      props.switchLoginActiveTab("register");
    }
  }, [props, props.loginActiveTab]);

  return (
    <div className="register">
      <div className="register-content">
        <div className="register-model-top">
          <span>{props.intl.formatMessage({ id: "Register" })}</span>
        </div>
        <Tabs
          className={"register-panel"}
          defaultActiveKey={props.loginActiveTab}
          activeKey={props.loginActiveTab}
          onChange={tabsCallback}
        >
          <TabPane
            tab={<FormattedMessage id="Register" defaultMessage="Register" />}
            key="register"
          >
            <div className="register-input">
              <Form
                form={form}
                {...layout}
                name="basic"
                initialValues={{ remember: true }}
                hideRequiredMark={true}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                onValuesChange={onValuesChange}
              >
                <div className="re-email">
                  {props.intl.formatMessage({ id: "Email" })}
                </div>
                <Form.Item
                  name="Email"
                  validateFirst={true}
                  rules={[
                    {
                      required: true,
                      message: props.intl.formatMessage({
                        id: "41006",
                        defaultMessage: "Please enter the Email"
                      })
                    },
                    {
                      pattern: /.*@.*/,
                      message: props.intl.formatMessage({
                        id: "41004",
                        defaultMessage: "Please enter a valid email"
                      })
                    }
                  ]}
                >
                  <Input
                    allowClear={true}
                    data-type="Email"
                    type="email"
                    onChange={onChange}
                  />
                </Form.Item>
                <div className="re-password">
                  <span>{props.intl.formatMessage({ id: "Password" })}</span>{" "}
                  <PasswordVerify pws={register.password} />
                </div>
                <PwsPrompt
                  pws={register.password}
                  visible={register.isFocus}
                  placement="top"
                >
                  <Form.Item
                    name="Password"
                    validateFirst={true}
                    rules={[
                      { validator: handlePassword },
                      {
                        required: true,
                        message: messageError("41008")
                      },
                      {
                        message: messageError("41002"),
                        max: 128
                      },
                      {
                        min: 8,
                        message: messageError("41002")
                      }
                    ]}
                  >
                    <Input.Password
                      allowClear={true}
                      onBlur={() =>
                        registerDispatch({ type: "isFocus", isFocus: false })
                      }
                      onFocus={() =>
                        registerDispatch({ type: "isFocus", isFocus: true })
                      }
                      data-type="Password"
                      onChange={onChange}
                    />
                  </Form.Item>
                </PwsPrompt>
                <div className="re-confirm">
                  {props.intl.formatMessage({ id: "Confirm_Password" })}
                </div>
                <Form.Item
                  name="ConfirmPassword"
                  className="re-form-item"
                  validateFirst={true}
                  rules={[
                    {
                      required: true,
                      message: props.intl.formatMessage({
                        id: "PleaseConfirm",
                        defaultMessage: "Please confirm password"
                      })
                    },
                    { validator: handleConfirmPassword }
                  ]}
                >
                  <Input.Password
                    allowClear={true}
                    data-type="ConfigPassword"
                    onChange={onChange}
                  />
                </Form.Item>
                <div className="register-checkbox" onChange={isCheck}>
                  <img
                    alt="select"
                    onClick={isCheck}
                    src={register.checked ? select : noSelect}
                  />
                  <div className="register-radio">
                    <FormattedMessage
                      id="register_text"
                      values={{
                        variable: (
                          <span
                            onClick={() => {
                              window.open(
                                "https://OPNX.com/terms-of-service/"
                              );
                            }}
                          >
                          Open Exchange Terms of Service.
                          </span>
                        )
                      }}
                    />
                  </div>
                </div>
                <Form.Item {...tailLayout} className="register-ant">
                  <div className="register-div">
                    <Button
                      loading={register.loadding}
                      type="primary"
                      htmlType="submit"
                    >
                      {props.intl.formatMessage({ id: "Register" })}
                    </Button>
                  </div>
                </Form.Item>
                <div className="login-entrance">
                  <span>Already have an account?</span>&nbsp;
                  <span onClick={toLogin}>Log in.</span>
                </div>
              </Form>
            </div>
          </TabPane>
          <TabPane
            tab={<FormattedMessage id="MetaMask" defaultMessage="MetaMask" />}
            key="metaMaskRegister"
          >
            <MetaMask />
          </TabPane>
        </Tabs>
      </div>
      <LimitModal
        visible={register.limitModalVisinle}
        onBack={() =>
          registerDispatch({
            type: "limitModalVisinle",
            limitModalVisinle: false
          })
        }
      />
      <BottomComponent />
    </div>
  );
}
const mapStateToProps = (state: any) => {
  return {
    loginActiveTab: state.loginActiveTab
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  injectIntl(
    HocIsUsModal<
      WrappedComponentProps & IRegisterPropsState & IRegisterDispatchState
    >(Register, "register")
  )
);
