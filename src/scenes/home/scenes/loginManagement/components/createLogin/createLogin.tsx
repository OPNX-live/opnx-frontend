import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Switch, Button, Select, Form, Row, Col, message } from "antd";
import InputLine from "components/inputLine/index";
import {
  CreateLoginAccount,
  getSubAccount,
  geetestType,
  geetestInit,
} from "service/http/http";
import TfaValidation from "components/tfaValidation";
import PasswordVerify from "components/PasswordVerify/PasswordVerify";
import PwsPrompt from "components/PwsPrompt/PwsPrompt";
import messageError from "utils/errorCode";
import { geetestValidatePackage, messageSuccess } from "utils";
import gt from "utils/gt";
import "./createLogin.scss";
import {
  FormattedMessage,
  WrappedComponentProps,
  injectIntl,
} from "react-intl";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
const { Option } = Select;

type IBindSubAaccount = {
  cancleHandler: () => void;
  hanlderProps: (current: number, pageSize: number) => void;
  current: number;
  pageSize: number;
  dashboardUserData: IDashboardUserData;
  intl: any;
};
type TCreateLoginState = {
  email: string;
  password: string;
  selectSub: string[];
  disabledBtn: boolean;
  switchTrade: boolean;
  switchWithdraw: boolean;
  selectAccount: any;
  loadding: boolean;
  tfa: boolean;
  tfaCode: string;
  lvl: number;
  isFoucs: boolean;
};
export class CreateLogin extends Component<
  IBindSubAaccount & WrappedComponentProps,
  TCreateLoginState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
      password: "",
      selectSub: [],
      disabledBtn: true,
      switchTrade: false,
      switchWithdraw: false,
      selectAccount: [],
      loadding: false,
      tfa: false,
      tfaCode: "",
      lvl: 1,
      isFoucs: false,
    };
  }
  componentDidMount() {
    getSubAccount().then((res) => {
      if (res.code === "0000") {
        this.setState({ selectAccount: res.data });
      } else {
        message.error(res.message);
      }
    });
  }
  handleEmail = (rule: any, value: any, callback: any) => {
    value = value.replace(/\s+/g, "");
    if (value === "") {
      return Promise.reject();
    } else {
      return Promise.resolve();
    }
  };
  handlePassword = (rule: any, value: any, callback: any) => {
    if (this.getLvl(value) === 1) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 2 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 3 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (this.getLvl(value) === 4 && value.length >= 8) {
      return Promise.resolve();
    }
    // if (/^[0-9]*$/.test(value) && value.replace(/\s+/g, "") !== "") {
    //   return Promise.reject(<FormattedMessage id="Min_8_Max_128_Error" />);
    // } else {
    return Promise.resolve();
    // }
  };
  // handler = (obj: any) => {
  //   const that = this;
  //   const data = {
  //     email: this.props.dashboardUserData.accountId,
  //     geetestType: "CREATE_LOGIN",
  //   };
  //   geetestValidatePackage(
  //     obj,
  //     data,
  //     () => {
  //       if (
  //         that.props.dashboardUserData.enableTfa &&
  //         that.props.dashboardUserData.tfaProtected.isLoginAndManagement
  //       ) {
  //         that.setState({ tfa: true });
  //       } else {
  //         that.addLogin();
  //       }
  //     },
  //     () => {}
  //   );
  // };
  onFinish = async (values: any) => {
    this.setState({ loadding: true });
    const that = this;
    this.setState({ loadding: true });
    onRecaptchaVerify(
      "",
      "CREATE_LOGIN",
      (token, action) => {
        if (
          that.props.dashboardUserData.enableTfa &&
          that.props.dashboardUserData.tfaProtected.isLoginAndManagement
        ) {
          that.setState({ tfa: true });
        } else {
          that.addLogin(token, action);
        }
      },
      () => this.setState({ loadding: false })
    );
  };
  onValuesChange = (changedValues: any, allValues: any) => {
    const emailValue = allValues.name;
    // &&allValues.name.replace(/\s+/g, "");
    const passwordValue = allValues.password;
    // ? allValues.password.replace(/\s+/g, "")
    // : "";
    this.setState({
      email: allValues.name,
      // .replace(/\s+/g, ""),
      password: allValues.password ? allValues.password : "",
      // ? allValues.password.replace(/\s+/g, "")
      // : "",
    });
    this.checkValue(emailValue, passwordValue);
  };
  checkValue = (emailValue: string, passwordValue: string) => {
    if (
      emailValue !== "" &&
      !/^[0-9]*$/.test(passwordValue) &&
      passwordValue !== "" &&
      passwordValue &&
      passwordValue.length >= 8 &&
      passwordValue.length <= 128 &&
      this.state.selectSub.length !== 0
    ) {
      this.setState({ disabledBtn: false });
    } else {
      this.setState({ disabledBtn: true });
    }
  };
  switch = (e: string, checked: boolean) => {
    if (e === "Trade") {
      this.setState({ switchTrade: checked });
    } else {
      this.setState({ switchWithdraw: checked });
    }
  };
  handleChange = (value: string[]) => {
    this.setState({ selectSub: value }, () => {
      this.checkValue(this.state.email, this.state.password);
    });
  };
  nameChange = (value: string, prevValue: string) => {
    let nextValue;
    nextValue = value.replace("@", "");
    if (value.indexOf(" ") !== -1) {
      nextValue = value.replace(" ", "");
    }
    return nextValue;
  };
  tfaCallback = (e: string) => {
    this.setState({ tfaCode: e }, () => {
      onRecaptchaVerify(
        "",
        "CREATE_LOGIN",
        (token, action) => {
          this.addLogin(token, action, e);
        },
        () => {}
      );
    });
  };
  tfaShowModal = (e: boolean) => {
    this.setState({ tfa: e });
  };
  addLogin = (token: string, action: string, tfa?: string) => {
    const { email, password, switchTrade, switchWithdraw, selectSub } =
      this.state;
    this.setState({ loadding: true });
    CreateLoginAccount(
      {
        userName: email,
        password,
        canTrade: switchTrade,
        canWithdraw: switchWithdraw,
        accountId: selectSub,
      },
      tfa,
      token,
      action
    ).then((res) => {
      this.setState({ loadding: false });
      if (res.code === "0000") {
        this.props.hanlderProps(this.props.current, this.props.pageSize);
        this.props.cancleHandler();
        message.success(messageSuccess("40001"));
      } else {
        message.error(res.message);
      }
    });
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
  render() {
    const {
      disabledBtn,
      switchTrade,
      // switchWithdraw,
      selectAccount,
      loadding,
      email,
      tfa,
      isFoucs,
      password,
    } = this.state;
    return (
      <Modal
        className="createLogin-model"
        title={
          <FormattedMessage
            id="Create_New_Login"
            defaultMessage="Create New Login"
          />
        }
        visible
        closable={true}
        footer={null}
        maskClosable={false}
        // onOk={this.handleOk}
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
              <Form.Item
                name="name"
                validateFirst={true}
                normalize={(value, prevValue) =>
                  this.nameChange(value, prevValue)
                }
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage id="Create_New_Login_Error1" />,
                  },
                  {
                    message: <FormattedMessage id="Max_Length_Error" />,
                    max: 32,
                  },
                  {
                    whitespace: true,
                    message: <FormattedMessage id="Create_New_Login_Error1" />,
                  },
                  { validator: this.handleEmail },
                ]}
              >
                <InputLine
                  id={"name"}
                  placeholder={this.props.intl.formatMessage({
                    id: "Login_Name",
                  })}
                  // onChange={this.nameChange}
                  // onChange={(val) =>
                  //   setFieldsValue({ name: val + "@example.com" })
                  // }
                  value={email}
                ></InputLine>
              </Form.Item>
              <div className="re-password">
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
                      message: <FormattedMessage id="Password_No_Set" />,
                    },
                    {
                      message: <FormattedMessage id="41002" />,
                      max: 128,
                    },
                    {
                      min: 8,
                      message: <FormattedMessage id="41002" />,
                    },
                    { validator: this.handlePassword },
                  ]}
                >
                  <InputLine
                    inputType="password"
                    id={"password"}
                    onBlur={() => this.setState({ isFoucs: false })}
                    onFocus={() => this.setState({ isFoucs: true })}
                    placeholder={this.props.intl.formatMessage({
                      id: "Login_Password",
                    })}
                  ></InputLine>
                </Form.Item>
              </PwsPrompt>
            </Col>
          </Row>
          <div className="bindSubAaccount-content">
            <p>
              <FormattedMessage id="Permission" />
            </p>
            <div className="bindSubAaccount-switch">
              <span>
                <FormattedMessage id="Can_Trade" />
              </span>
              <Switch
                data-value="Trade"
                onClick={this.switch.bind(this, "Trade")}
                defaultChecked={switchTrade}
              />
            </div>
            {/* <div className="bindSubAaccount-switch">
              <span>Can withdraw</span>
              <Switch
                onClick={this.switch.bind(this, "withdraw")}
                defaultChecked={switchWithdraw}
              />
            </div> */}
          </div>
          <div className="bindSubAaccount-sub">
            <p>Assign to Sub Account</p>
            <Select
              mode="multiple"
              size="large"
              placeholder="Assign to Sub Account"
              bordered={false}
              onChange={this.handleChange}
              style={{ width: "100%" }}
              getPopupContainer={(triggerNode) => triggerNode}
            >
              {selectAccount.map((item: any) => {
                return (
                  <Option
                    key={item._id}
                    value={item._id}
                    disabled={item.accountStatus !== "ACTIVE"}
                  >
                    {item.accountName}
                  </Option>
                );
              })}
            </Select>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            className="bindSubAaccount-btn"
            disabled={disabledBtn}
            loading={loadding}
            style={{ background: disabledBtn ? "#ADB1BB" : "" }}
          >
            <FormattedMessage id="Submit" />
          </Button>
        </Form>
        {tfa ? (
          <TfaValidation
            visable={tfa}
            callBack={this.tfaCallback}
            onCloseModel={this.tfaShowModal}
          />
        ) : null}
      </Modal>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  allLoginAccount: state.allLoginAccount,
  dashboardUserData: state.dashboardUserData,
});
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CreateLogin));
