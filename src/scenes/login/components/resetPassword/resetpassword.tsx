import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Form, message, Input } from "antd";
import BottomComponent from "components/bottomCpmonent/index";
import { restPassword } from "service/http/http";
import { Store } from "antd/lib/form/interface";
import history from "router/history";
import TfaValidation from "../../../../components/tfaValidation";
import PwsPrompt from "components/PwsPrompt/PwsPrompt";
import PasswordVerify from "components/PasswordVerify/PasswordVerify";
import { WrappedComponentProps, FormattedMessage } from "react-intl";
import "./resetpassword.scss";
import { Verification } from "router/configRouter";
import messageError from "utils/errorCode";
import { intl } from "utils/Language";
import {
  setSubAccouts,
  setUser,
  setIsLogin,
  setDashboardUserData,
} from "store/actions/publicAction";
import { FormInstance } from "antd/lib/form";

type VerificationState = {
  stateHistory: { email: string; type: string; code: string; auth: string };
  password: string;
  confirmPassword: string;
  loading: boolean;
  disabled: boolean;
  isTfaValidation: boolean;
  lvl: number;
  isFoucs: boolean;
};

type IResetPasswordPropsState = ReturnType<typeof mapStateToProps>;
type IResetPasswordDispatchState = ReturnType<typeof mapDispatchToProps> &
  IResetPasswordPropsState;
class ResetPassword extends Component<
  IResetPasswordDispatchState & WrappedComponentProps,
  VerificationState
> {
  formRef = React.createRef<FormInstance>() || undefined;
  constructor(props: any) {
    super(props);
    this.state = {
      stateHistory: { email: "", type: "", code: "", auth: "" },
      password: "",
      confirmPassword: "",
      loading: false,
      disabled: true,
      isTfaValidation: false,
      lvl: 0,
      isFoucs: false,
    };
  }
  componentDidMount() {
    const state = history.location.state! as {
      email: string;
      type: string;
      code: string;
      auth: string;
    };
    if (state) {
      this.setState({ stateHistory: state });
    } else {
      window.location.href = "/login";
    }
    Verification.preload();
  }
  onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.dataset.type === "NewPassword") {
      this.setState({
        password: e.target.value.replace(/\s+/g, ""),
      });
      e.target.value.length < 8 &&
        this.setState({ lvl: e.target.value.length });
    } else {
      this.setState({
        confirmPassword: e.target.value!.replace(/\s+/g, ""),
      });
    }
    setTimeout(() => {
      if (this.state.password !== "" && this.state.confirmPassword !== "") {
        this.setState({ disabled: false });
      } else {
        this.setState({ disabled: true });
      }
    }, 100);
  }

  onSubmit = (code?: string) => {
    const { stateHistory } = this.state;
    if (
      this.props.users === "" ||
      this.props.users === undefined ||
      this.props.users === null ||
      this.props.users.token === ""
    ) {
      this.setState({ loading: true });
      if (stateHistory.auth.length) {
        this.props.setDashboardUserData({
          ...this.props.dashboardUserData,
          tfaType: stateHistory.auth,
        });
        this.setState({
          isTfaValidation: true,
        });
      } else {
        this.updatePassword();
      }
      // restPasswordType(this.state.stateHistory.email).then((res) => {
      //   this.setState({ loading: false });
      //   if (res.code === '0000') {
      //     if (res.data.enableTfa) {
      //       this.props.setDashboardUserData({
      //         ...this.props.dashboardUserData,
      //         tfaType: res.data.type,
      //       });
      //       this.setState({
      //         isTfaValidation: true,
      //       });
      //     } else {
      //       this.updatePassword();
      //     }
      //   }
      // });
    } else {
      if (
        this.props.dashboardUserData.enableTfa &&
        this.props.dashboardUserData.tfaProtected.isModifications
      ) {
        this.setState({
          isTfaValidation: true,
        });
      } else {
        this.updatePassword();
      }
    }
  };

  updatePassword = (validCode?: string) => {
    this.setState({ loading: true });
    restPassword({
      email: this.state.stateHistory.email,
      password: this.state.password,
      code: this.state.stateHistory.code,
      confirmPassword: this.state.confirmPassword,
      enableTfa: validCode ? true : false,
      validCode,
    })
      .then((res) => {
        this.setState({ loading: false });
        if (res.success) {
          message.success(intl("success"));
          this.props.setIsLogin(false);
          this.props.setUser("");
          window.location.href = "/login";
          // history.replace("/login");
        } else {
          message.error(res.message);
        }
      })
      .catch(() => this.setState({ loading: false }));
  };

  onFinish = (e: Store) => {
    this.onSubmit();
  };
  handleConfirmPassword = (rule: any, value: any, callback: any) => {
    // if (this.state.password !== value) {
    //   return Promise.reject('Requires 8-128 characters, not pure numbers');
    // }
    // Promise.resolve();
    console.log(this.state.password, "this.state.password");
    console.log(value, "value");

    if (this.state.password !== value) {
      callback(intl("Passwords do not match, please re-enter"));
      return;
    }
    callback();
  };
  handleEmail = async (rule: any, value: any, callback: any) => {
    const re = /^[0-9a-zA-Z`~!@#$%^&*()_+<>?:"{},./;'[\]\\]*$/;
    if (!re.test(value)) {
      return Promise.reject(
        `Invalid symbols. Please use only${`\`~!@#$%^&*()_+<>?:"{},./;'[\\]`}`
      );
    }
    if (this.getLvl(value) === 1) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 2 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 3 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 4 && value.length >= 8) {
      return Promise.resolve();
    }

    const email = this.state.stateHistory.email;
    return email
      ? await this.onPasswordStrong(email, value, "pwd")
      : Promise.resolve();
  };
  onPasswordStrong = async (email: string, password: string, type: string) => {
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
        return Promise.reject(intl("DontUsePart"));
      } else {
        this.formRef.current?.setFields([
          {
            name: "Password",
            errors: [intl("DontUsePart")],
          },
        ]);
      }
    } else {
      if (type === "pwd") {
        return Promise.resolve();
      } else {
        this.formRef.current?.setFields([
          {
            name: "Password",
            errors: [],
          },
        ]);
      }
    }
  };
  getLvl = (pwd: string) => {
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
      lvl++;
    }
    return lvl;
  };
  render() {
    const { password, isFoucs } = this.state;
    return (
      <div className="resetpassword">
        <div className="resetpassword-content">
          <div className="resetpassword-model-top">
            {
              <FormattedMessage
                id="reset_login_password"
                defaultMessage="Reset Login Password"
              />
            }
          </div>
          <div className="resetpassword-input">
            <Form
              name="basic"
              initialValues={{ remember: true }}
              hideRequiredMark={true}
              onFinish={this.onFinish}
              layout={"vertical"}
              ref={this.formRef}
              // onFinishFailed={onFinishFailed}
            >
              <div className="re-password">
                <span>
                  <FormattedMessage id="Password" defaultMessage="Password" />
                </span>
                <PasswordVerify pws={password} />
              </div>
              <PwsPrompt pws={password} visible={isFoucs} placement="top">
                <Form.Item
                  name="NewPassword"
                  // label="NewPassword"
                  validateFirst={true}
                  rules={[
                    {
                      required: true,
                      message: messageError("41009"),
                    },
                    {
                      message: messageError("41002"),
                      max: 128,
                    },
                    {
                      min: 8,
                      message: messageError("41002"),
                    },
                    { validator: this.handleEmail },
                    // {
                    //   validator: (_, value) => {
                    //     if (/^[0-9]*$/.test(value)) {
                    //       return Promise.reject(
                    //         'Requires 8-128 characters, not pure numbers'
                    //       );
                    //     }
                    //     return Promise.resolve();
                    //   },
                    // },
                  ]}
                >
                  {/* <InputLine
                      allowClear
                      data-type="NewPassword"
                      id={'NewPassword'}
                      maxLength={128}
                      onChange={(e) => this.onChangeText(e)}
                      placeholder="New Password"
                      inputType={'password'}
                    ></InputLine> */}
                  <Input.Password
                    data-type="NewPassword"
                    id={"NewPassword"}
                    maxLength={128}
                    onBlur={() => this.setState({ isFoucs: false })}
                    onFocus={() => this.setState({ isFoucs: true })}
                    allowClear
                    onChange={(e) => this.onChangeText(e)}
                    placeholder={intl("NewPassword")}
                  />
                </Form.Item>
              </PwsPrompt>
              <Form.Item
                name="ConfirmPassword"
                label={intl("ConfirmPassword")}
                validateFirst={true}
                rules={[
                  {
                    required: true,
                    message: intl("PleaseConfirmPassword"),
                  },
                  { validator: this.handleConfirmPassword },
                ]}
              >
                {/* <InputLine
                      allowClear
                      id={'confirmPassword'}
                      data-type="confirmPassword"
                      maxLength={128}
                      placeholder="Confirm Password"
                      onChange={(e) => this.onChangeText(e)}
                      inputType={'password'}
                    ></InputLine> */}

                <Input.Password
                  data-type="ConfirmPassword"
                  id={"ConfirmPassword"}
                  maxLength={128}
                  allowClear
                  onChange={(e) => this.onChangeText(e)}
                  placeholder={intl("NewPassword")}
                />
              </Form.Item>

              <Form.Item className="resetpassword-ant">
                <Button
                  className="btn-gradient"
                  type="primary"
                  htmlType="submit"
                  // disabled={this.state.disabled}
                  loading={this.state.loading}
                >
                  {intl("Submit")}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <BottomComponent />
        {this.state.isTfaValidation ? (
          <TfaValidation
            visable={this.state.isTfaValidation}
            onCloseModel={() => {
              this.setState({
                isTfaValidation: false,
              });
            }}
            callBack={(code) => {
              console.log(code);
              this.updatePassword(code);
            }}
          />
        ) : null}
      </div>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setIsLogin(data: boolean) {
      dispatch(setIsLogin(data));
    },
    setUser(data: any) {
      dispatch(setUser(data));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
