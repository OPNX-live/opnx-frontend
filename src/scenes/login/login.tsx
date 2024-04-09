import React, { Component } from "react";
import { Button, Form, message, Input, Tabs } from "antd";
import { connect } from "react-redux";
import history from "router/history";
import {
  ForgetPassword,
  // Register,
  TfaLoginValidation,
} from "router/configRouter";
import SubAccountModalCpmonent from "components/subAccountModalCpmonent/index";
import {
  setUser,
  setIsLogin,
  setSubAccouts,
  setAccountName,
  switchLoginActiveTab,
  setTfaList,
} from "../../store/actions/publicAction";
import QrCodeLogin from "./components/qrCodeLogin/qrCodeLogin";
import { Store } from "antd/lib/form/interface";
import {
  login,
  geetestInit,
  geetestValidate,
  sendMail,
} from "service/http/http";
import gt from "utils/gt";
import "./login.scss";
import messageError from "utils/errorCode";
import { FormInstance } from "antd/lib/form";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import MetaMask from "../metaMask/Metamask";

import { BASE_URL } from "scenes/home/components/uiHeader/TopHeader";
import { CodeLogin, PasswordLogin } from "assets/image";
import { HocIsUsModal } from "components/HocIsUsModal/HocIsUsModal";

const { TabPane } = Tabs;
interface IModelIState {
  visible: boolean;
  disable: boolean;
  loading: boolean;
  emailText: string;
  pwdText: string;
  loginCount: number;
  inputDisabled: boolean;
  readOnly: boolean;
  isSubmit: boolean;
  stateHistory: { email: string; password: string };
  path: string;
  isTfaValidation: boolean;
  istfaProtected: boolean;
  vote: string;
  codeStatus: boolean;
}

// type TOwnProps = { switchLoginActiveTab: Function };
type ILoginPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type ILoginDispatchState = ReturnType<typeof mapDispatchToProps> &
  ILoginPropsState & {
    form: any;
  } & WrappedComponentProps;
const tailLayout = {};
class Login extends Component<ILoginDispatchState, IModelIState> {
  private myRef = React.createRef<FormInstance>();
  constructor(props: ILoginDispatchState) {
    super(props);
    this.state = {
      disable: true,
      visible: false,
      loading: false,
      emailText: "",
      pwdText: "",
      loginCount: 1,
      inputDisabled: true,
      readOnly: true,
      isSubmit: true,
      stateHistory: { email: "", password: "" },
      path: "",
      isTfaValidation: false,
      istfaProtected: false,
      vote: "",
      codeStatus: false,
    };
  }
  componentDidMount() {
    const state = history.location.state! as any;
    if (this.props.users && this.props.users.token) {
      history.replace("/home");
    }
    ForgetPassword.preload();
    // Register.preload();
    TfaLoginValidation.preload();
    const url = window.location.search;
    this.setState({
      path: url ? url.split("=")[1] : "",
    });
    if (state) {
      this.myRef.current?.setFieldsValue({
        email: state.email,
      });
      this.myRef.current?.setFieldsValue({
        password: state.pad,
      });
      this.setState(
        {
          stateHistory: state,
          pwdText: state.pad,
          emailText: state.email,
          vote: state.name,
        },
        () => {
          this.setState({
            disable: false,
          });
        }
      );
    }
    setTimeout(() => {
      this.setState({
        inputDisabled: false,
      });
    }, 300);

    if (!this.props.isLogin) {
      this.props.setUser("");
    }
    if (!this.props.loginActiveTab) {
      this.props.switchLoginActiveTab("login");
    } else if (
      this.props.loginActiveTab.toLowerCase().indexOf("register") >= 0
    ) {
      this.props.switchLoginActiveTab("login");
    }
  }

  /*getUserData = async () => {
    const response = await UserData();
    if (response) {
      if (response && response.code === "0000") {
        this.props.setIsLogin(response.success);
        this.props.users.token && history.replace("/home")
      } else {
        message.error(messageError(response.code));
        this.props.switchLoginActiveTab("login");
      }
    }
    // console.log(response);
  }*/

  onFinish = (values: Store) => {
    this.submit();
  };

  submit = () => {
    // if (this.state.loginCount > 3) {
    if (this.state.isSubmit) {
      this.setState({ isSubmit: false, loading: true });
      geetestInit(this.state.emailText).then((data: any) => {
        gt.initGeetest(
          {
            gt: data.gt,
            challenge: data.challenge,
            offline: !data.success, // 表示用户后台检测极验服务器是否宕机
            new_captcha: data.new_captcha, // 用于宕机时表示是新验证码的宕机
            product: "bind", // 产品形式，包括：float，popup
            lang: this.props.SwitchLanguage ? this.props.SwitchLanguage : "en",
            width: "300px",
            https: true,
          },
          this.handler
        );
      });
    }
    // } else {
    //   this.setState({ loading: true });
    //   this.login();
    // }
  };

  onSendMail = () => {};

  onFinishFailed = (errorInfo: Store) => {};

  onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.dataset.type === "email") {
      this.setState(
        {
          emailText: e.target.value.replace(/\s+/g, ""),
        },
        () => {
          if (this.state.emailText === "" || this.state.pwdText === "") {
            this.setState({
              disable: true,
            });
          } else {
            this.setState({
              disable: false,
            });
          }
        }
      );
    } else {
      this.setState(
        {
          pwdText: e.target.value!.replace(/\s+/g, ""),
        },
        () => {
          if (this.state.emailText === "" || this.state.pwdText === "") {
            this.setState({
              disable: true,
            });
          } else {
            this.setState({
              disable: false,
            });
          }
        }
      );
    }
  }

  handler = (obj: any) => {
    this.setState({ loading: true });
    obj.appendTo("#captcha");
    obj
      .onReady(function () {
        obj.verify();
      })
      .onSuccess(() => {
        this.setState({ isSubmit: true });
        const result = obj.getValidate();
        const data = {
          email: this.state.emailText,
          geetest_challenge: result.geetest_challenge,
          geetest_validate: result.geetest_validate,
          geetest_seccode: result.geetest_seccode,
          clientType: "web",
          geetestType: "LOGIN",
        };
        geetestValidate(data)
          .then((resGeestest: any) => {
            if (resGeestest.status === "success") {
              this.login();
            } else {
              this.setState({ loading: false });
              message.warning(
                this.props.intl.formatMessage({
                  id: "VerificationFailed",
                  defaultMessage: "Verification failed, please try again",
                })
              );
              obj.reset();
            }
          })
          .catch((err) => {
            this.setState({ loading: false });
            message.warning(
              this.props.intl.formatMessage({
                id: "VerificationFailed",
                defaultMessage: "Verification failed, please try again",
              })
            );
            obj.reset();
          });
      })
      .onClose(() => {
        this.setState({ isSubmit: true });
        this.setState({ loading: false });
        message.warning(
          this.props.intl.formatMessage({
            id: "PleaseCompleteVerification",
            defaultMessage: "Please complete verification",
          })
        );
      });
  };

  login = () => {
    const { setUser, setIsLogin, setSubAccouts, setTfaList } = this.props;
    const { path, vote } = this.state;
    login({
      email: this.state.emailText.trim(),
      password: this.state.pwdText.trim(),
    })
      .then((res) => {
        if (res.code === "0000") {
          this.setState({ loginCount: 1 });
          setTfaList(res.data.tfaTypes || []);
          if (res.data.enableTfa === null || res.data.enableTfa === true) {
            setTimeout(() => {
              this.setState({
                loading: false,
              });
              history.push({
                pathname: "/loginTfa",
                state: { data: res.data, path, vote },
              });
            }, 1000);
          } else {
            setUser({ ...res.data });
            setIsLogin(true);
            setSubAccouts();
            if (vote === "vote") {
              setTimeout(() => {
                this.setState({ loading: false });
                history.push("/Vote");
              }, 1000);
              return;
            }
            const paths = sessionStorage.getItem("redirectPath");
            if (paths) {
              setTimeout(() => {
                this.setState({ loading: false });
                sessionStorage.removeItem("redirectPath");
                window.location.href = BASE_URL! + paths;
              }, 1000);
            } else {
              setTimeout(() => {
                this.setState({ loading: false });
                history.push("/home");
              }, 1000);
            }
          }
        } else {
          this.setState({ loading: false });
          this.setState({
            loginCount: this.state.loginCount + 1,
          });
          res.code && message.error(res.message);
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  };

  tabsCallback = (key: string) => {
    this.props.switchLoginActiveTab(key);
  };

  toRegister = () => {
    this.props.switchLoginActiveTab("register");
    /*setTimeout(() => {

    }, 500);*/
    history.push("/register");
  };
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const { visible, codeStatus, vote } = this.state;
    return (
      <div
        className="login"
        onClick={() => {
          this.setState({
            readOnly: false,
          });
        }}
      >
        <div className="login-content">
          <div className="login-model-top">
            <span className="login-text">
              {" "}
              <FormattedMessage id="Login" defaultMessage="Login" />
            </span>
            <div
              className="tab-login"
              onClick={() => this.setState({ codeStatus: !codeStatus })}
            >
              {codeStatus ? <PasswordLogin /> : <CodeLogin />}
            </div>
          </div>
          {codeStatus ? (
            <QrCodeLogin vote={vote} codeStatus={codeStatus} />
          ) : (
            <Tabs
              className={"login-panel"}
              defaultActiveKey={this.props.loginActiveTab}
              activeKey={this.props.loginActiveTab}
              onChange={this.tabsCallback}
            >
              <TabPane
                tab={<FormattedMessage id="Account" defaultMessage="Account" />}
                key="login"
              >
                <div className="login-input">
                  <Form
                    name="basic_l"
                    layout={"vertical"}
                    ref={this.myRef}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                  >
                    <Form.Item
                      name="email"
                      label={
                        <FormattedMessage
                          id="Account"
                          defaultMessage="Account"
                        />
                      }
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="create_title_error1"
                              defaultMessage="Please input your Username!"
                            />
                          ),
                        },
                      ]}
                    >
                      <Input
                        id={"email"}
                        maxLength={254}
                        allowClear
                        disabled={this.state.inputDisabled}
                        data-type="email"
                        onChange={(e) => this.onChangeText(e)}
                        // placeholder="Account"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      label={
                        <FormattedMessage
                          id="Password"
                          defaultMessage="Password"
                        />
                      }
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="create_title_error2"
                              defaultMessage="Please input your Password!"
                            />
                          ),
                        },
                      ]}
                    >
                      <Input.Password
                        allowClear
                        maxLength={128}
                        data-type="password"
                        onChange={(e) => this.onChangeText(e)}
                        // placeholder="Password"
                        onPressEnter={this.submit}
                      />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                      <Button
                        style={{ marginTop: "10px" }}
                        className="btn-no-gradient"
                        type="primary"
                        loading={this.state.loading}
                        htmlType="submit"
                      >
                        <FormattedMessage id="Login" defaultMessage="Log in" />
                      </Button>
                    </Form.Item>
                  </Form>

                  <div className="password-register">
                    <label
                      className="forget-link"
                      style={{ color: "#333333", textDecoration: "underline" }}
                      onClick={() => {
                        if (this.state.emailText !== "") {
                          sendMail("", "FORGOT_PWD", this.state.emailText).then(
                            (res) => {
                              if (res.code === "0000") {
                                history.push({
                                  pathname: "/forgetpassword",
                                  state: {
                                    loginName: this.state.emailText,
                                  },
                                });
                              } else {
                                res.code &&
                                  message.error(res.message);
                              }
                            }
                          );
                        } else {
                          history.replace("/forgetpassword");
                        }
                      }}
                    >
                      <FormattedMessage
                        id="forgot_password"
                        defaultMessage="Forgot password"
                      />
                    </label>
                    <div style={{ display: "flex" }}>
                      <label htmlFor="" className="account-yet">
                        <FormattedMessage
                          id="no_account_yet"
                          defaultMessage="No account yet?"
                        />
                      </label>
                      <label
                        className="forget-link"
                        style={{
                          marginLeft: "3px",
                        }}
                        onClick={this.toRegister}
                      >
                        <FormattedMessage
                          id="Register"
                          defaultMessage="Register"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </TabPane>
              <TabPane
                tab={
                  <FormattedMessage id="MetaMask" defaultMessage="MetaMask" />
                }
                key="metaMaskLogin"
              >
                <MetaMask />
              </TabPane>
            </Tabs>
          )}
        </div>
        {visible ? (
          <SubAccountModalCpmonent
            visible={visible}
            onCloseModal={(e) => this.setState({ visible: e })}
          ></SubAccountModalCpmonent>
        ) : (
          ""
        )}
      </div>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    isLogin: state.isLogin,
    users: state.users,
    SwitchLanguage: state.SwitchLanguage,
    loginActiveTab: state.loginActiveTab,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser(data: any, type?: string) {
      dispatch(setUser(data, "login"));
    },
    setIsLogin(data: boolean) {
      dispatch(setIsLogin(data));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
    setAccountName(data: string) {
      dispatch(setAccountName(data));
    },
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    },
    setTfaList(data: string[]) {
      dispatch(setTfaList(data));
    },
  };
};
// export default connect(mapStateToProps)(Form.create())
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(HocIsUsModal<ILoginDispatchState>(Login, "login")));
