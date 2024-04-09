import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Form, Row, Col, Button, message } from "antd";
import InputLine from "components/inputLine/index";
import { geetestInit, MenaRestPassword } from "service/http/http";
import messageError from "utils/errorCode";
import "./resetPassword.scss";
import { FormattedMessage } from "react-intl";
import PasswordVerify from "components/PasswordVerify/PasswordVerify";
import PwsPrompt from "components/PwsPrompt/PwsPrompt";
import { geetestValidatePackage, messageSuccess } from "utils";
import gt from "utils/gt";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
type IPermissionProps = {
  cancleHandler: () => void;
  AccountProps: IAllLoginAccount;
  intl: any;
  users: Iusers;
};
type IPermissionState = {
  password: string;
  disabled: boolean;
  lvl: number;
  isFoucs: boolean;
  loading: boolean;
};
export class ResetPassword extends Component<
  IPermissionProps,
  IPermissionState
> {
  constructor(props: IPermissionProps) {
    super(props);
    this.state = {
      password: "",
      disabled: true,
      lvl: 1,
      isFoucs: false,
      loading: false,
    };
  }
  handleEmail = (rule: any, value: any, callback: any) => {
    if (this.getLvl(value) === 1) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 2 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 3 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 4 && value.length >= 8) {
      return Promise.resolve();
    }
    return Promise.resolve();
  };
  // handler = (obj: object) => {
  //   const data = {
  //     email: this.props.users.email,
  //     geetestType: "COMMON",
  //   };
  //   const that = this;
  //   geetestValidatePackage(
  //     obj,
  //     data,
  //     () => {
  //       that.reset.bind(this)();
  //     },
  //     () => {
  //       that.setState({ loading: false });
  //       // this.setState({ loginLoading: false });
  //     }
  //   );
  // };
  reset = (token: string, action: string) => {
    const { password } = this.state;
    MenaRestPassword(
      {
        loginId: this.props.AccountProps.loginKey,
        password,
      },
      token,
      action
    ).then((res) => {
      this.setState({ loading: false });
      if (res.code === "0000") {
        this.props.cancleHandler();
        message.success(messageSuccess("40006"));
      } else {
        message.error(res.message);
      }
    });
  };
  onFinish = async (value: any) => {
    this.setState({ loading: true });
    const that = this;
    onRecaptchaVerify(
      "",
      "COMMON",
      (token, action) => {
        that.reset.bind(this, token, action)();
      },
      () => that.setState({ loading: false })
    );
  };
  onValuesChange = (changedValues: any, allValues: any) => {
    const passwordValue = allValues.password
      ? allValues.password.replace(/\s+/g, "")
      : "";
    this.setState({
      password: allValues.password
        ? allValues.password.replace(/\s+/g, "")
        : "",
    });
    this.checkValue(passwordValue);
  };
  checkValue = (passwordValue: string) => {
    if (
      !/^[0-9]*$/.test(passwordValue) &&
      passwordValue !== "" &&
      passwordValue.length >= 8 &&
      passwordValue.length <= 128
    ) {
      this.setState({ disabled: false });
    } else {
      this.setState({ disabled: true });
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
    if (/[`~!@#$%^&*()_+<>?:"{},./;'[\]]/.test(pwd)) {
      lvl++;
    }
    return lvl;
  };
  nameChange = (value: string, prevValue: string) => {
    let nextValue;
    nextValue = value.replace(" ", "");
    return nextValue;
  };
  render() {
    const { password, isFoucs, loading } = this.state;
    return (
      <Modal
        className="permission-model"
        title={<FormattedMessage id="Reset_Password" />}
        visible
        closable={true}
        footer={null}
        maskClosable={false}
        onCancel={this.props.cancleHandler}
      >
        <Form
          name="basic"
          initialValues={{
            remember: true,
          }}
          hideRequiredMark={true}
          onFinish={this.onFinish}
          onValuesChange={this.onValuesChange}
        >
          <Row>
            <Col
              span={24}
              style={{
                textAlign: "left",
                marginTop: "15px",
              }}
            >
              <div className="re-password">
                <span>{this.props.intl.formatMessage({ id: "Password" })}</span>{" "}
                <PasswordVerify pws={password} />
              </div>
              <PwsPrompt pws={password} visible={isFoucs} placement="top">
                <Form.Item
                  name="password"
                  validateFirst={true}
                  normalize={(value, prevValue) =>
                    this.nameChange(value, prevValue)
                  }
                  rules={[
                    {
                      required: true,
                      message: <FormattedMessage id="Password_Set" />,
                    },
                    {
                      message: <FormattedMessage id="41002" />,
                      max: 128,
                    },
                    {
                      min: 8,
                      message: <FormattedMessage id="41002" />,
                    },
                    { validator: this.handleEmail },
                  ]}
                >
                  <InputLine
                    allowClear
                    inputType="password"
                    onBlur={() => this.setState({ isFoucs: false })}
                    onFocus={() => this.setState({ isFoucs: true })}
                    id={"password"}
                    placeholder={this.props.intl.formatMessage({
                      id: "Enter_Password",
                    })}
                  ></InputLine>
                </Form.Item>
              </PwsPrompt>
            </Col>
          </Row>
          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              loading={loading}
              className="permission-btn"
              disabled={this.state.disabled}
              style={{ background: this.state.disabled ? "#ADB1BB" : "" }}
            >
              <FormattedMessage id="Submit" />
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const mapStateToProps = (state: { users: Iusers }) => ({});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
