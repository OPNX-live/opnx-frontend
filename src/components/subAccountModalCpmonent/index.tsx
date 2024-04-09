import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Form, Button, Select, message } from "antd";
import InputLine from "../inputLine/index";
import {
  addAccout,
  geetestValidate,
  geetestInit,
  geetestType,
} from "../../service/http/http";
import close from "assets/image/modal_close.png";
import "./index.scss";
import { setAccoutList, setSubAccouts } from "store/actions/publicAction";
import messageError from "utils/errorCode";
import gt from "utils/gt";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
interface IModelIProps {
  visible: boolean;
  onCloseModal: (off: boolean) => void;
}

interface IModelState {
  loadding: boolean;
  inputValue: string;
}
type ISubAccountModalCpmonentPropsState = ReturnType<typeof mapStateToProps> &
  IModelIProps;
type ISubAccountModalCpmonentDispatchState = ReturnType<
  typeof mapDispatchToProps
> &
  ISubAccountModalCpmonentPropsState;

class SubAccountModalCpmonent extends Component<
  ISubAccountModalCpmonentDispatchState & WrappedComponentProps,
  IModelState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      loadding: false,
      inputValue: "",
    };
  }
  handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.props.onCloseModal(false);
  };
  onFinish = (e: any) => {
    this.setState({
      loadding: true,
    });
    // geetestType("CREATE_SUB_ACCOUNT").then((res) => {
    //   if (res.success) {
    //     if (res.data) {
    //       this.captchaObj(e.userName, e.tradingType);
    //     } else {
    onRecaptchaVerify(
      "",
      "CREATE_SUB_ACCOUNT",
      (token, action) => {
        this.setState({
          loadding: true,
        });
        this.addUserAccount(e.userName, e.tradingType, token, action);
      },
      () => {}
    );
    //   }
    // } else {
    //   message.warning(res.message);
    // }
    // });
  };
  addUserAccount = (
    userName: string,
    tradingType: string,
    token?: string,
    action?: string
  ) => {
    addAccout(userName, "TRADING", tradingType, token, action).then((res) => {
      this.setState({
        loadding: false,
      });
      if (res.success) {
        message.success("Successful");
        this.props.onCloseModal(false);
        this.props.setSubAccouts();
        this.props.setAccoutList(true);
      } else {
        message.warning(res.message);
      }
    });
  };
  captchaObj = (userName: string, tradingType: string) => {
    const that = this;
    onRecaptchaVerify(
      "",
      "CREATE_SUB_ACCOUNT",
      (token, action) => {
        that.setState({
          loadding: true,
        });
        this.addUserAccount(userName, tradingType, token, action);
      },
      () => {}
    );
    // const handler = function (captchaObj: any) {
    //   captchaObj.appendTo("#captcha");
    //   that.setState({
    //     loadding: false,
    //   });
    //   captchaObj
    //     .onReady(function () {
    //       captchaObj.verify();
    //       that.setState({
    //         loadding: false,
    //       });
    //     })
    //     .onSuccess(() => {
    //       that.setState({
    //         loadding: true,
    //       });
    //       const result = captchaObj.getValidate();
    //       const data = {
    //         email: that.props.dashboardUserData.accountId,
    //         geetest_challenge: result.geetest_challenge,
    //         geetest_validate: result.geetest_validate,
    //         geetest_seccode: result.geetest_seccode,
    //         clientType: "web",
    //         geetestType: "CREATE_SUB_ACCOUNT",
    //       };
    //       geetestValidate(data)
    //         .then((resGeestest: any) => {
    //           if (resGeestest.status === "success") {
    //             that.addUserAccount(userName, tradingType);
    //           } else {
    //             message.warning(messageError(resGeestest.code));
    //             captchaObj.reset();
    //             that.setState({
    //               loadding: false,
    //             });
    //           }
    //         })
    //         .catch((err: any) => {
    //           message.warning(messageError(err.code));
    //           captchaObj.reset();
    //           that.setState({
    //             loadding: false,
    //           });
    //         });
    //     })
    //     .onClose(() => {
    //       that.setState({
    //         loadding: false,
    //       });
    //     });
    // };
  };
  nameChange = (value: string, prevValue: string) => {
    return value.replace(/\s+/g, "");
  };
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      inputValue: e.target.value,
    });
  };
  render() {
    const { loadding, inputValue } = this.state;
    const { intl } = this.props;
    return (
      <Modal
        centered
        width={478}
        visible={this.props.visible}
        onCancel={this.handleCancel}
        destroyOnClose={true}
        okButtonProps={{ disabled: true }}
        cancelButtonProps={{ disabled: true }}
        footer={null}
        closeIcon={<img width={14} alt="close" src={close} />}
      >
        <div className="sub-account-modal">
          <div className="modal-title">Create New Sub Accounts</div>
          <Form
            name="normal_sub_account_form"
            className="modal-form"
            layout={"vertical"}
            hideRequiredMark={true}
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
          >
            <Form.Item
              name="userName"
              normalize={(value, prevValue) =>
                this.nameChange(value, prevValue)
              }
              rules={[
                {
                  required: false,
                  message: intl.formatMessage({ id: "create_title_error1" }),
                },
                {
                  message: "",
                  max: 32,
                },
              ]}
            >
              <InputLine
                allowClear
                id={"names"}
                placeholder="Add Sub Account"
                onChange={this.onChange}
              ></InputLine>
            </Form.Item>
            <Form.Item
              name="tradingType"
              label={"Margin Type"}
              rules={[
                {
                  required: true,
                  message: "Please select your tradingType!",
                },
              ]}
            >
              <Select
                placeholder={"Please choose"}
                getPopupContainer={(triggerNode) => triggerNode}
              >
                <Select.Option value="PORTFOLIO">Portfolio</Select.Option>
                <Select.Option value="STANDARD">Standard</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                className="btn-gradient btn-sub"
                type="primary"
                htmlType="submit"
                disabled={inputValue === "" ? true : false}
                loading={loadding}
                style={
                  inputValue === ""
                    ? {
                        backgroundColor: "rgb(173, 177, 187)",
                        color: "rgba(255, 255, 255, 1)",
                      }
                    : {}
                }
              >
                Create Sub Account
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setAccoutList(data: any) {
      dispatch(setAccoutList(data));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SubAccountModalCpmonent));
