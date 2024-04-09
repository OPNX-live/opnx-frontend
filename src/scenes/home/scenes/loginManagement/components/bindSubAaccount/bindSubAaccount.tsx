import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Switch, Button, Select, message } from "antd";
import { getSubAccount, AddBind } from "service/http/http";
import TfaValidation from "components/tfaValidation";
import messageError from "utils/errorCode";
import "./bindSubAaccount.scss";
import { FormattedMessage, WrappedComponentProps } from "react-intl";

const { Option } = Select;

type IBindSubAaccountProps = {
  cancleHandler: () => void;
  AccountProps: IAllLoginAccount;
  hanlderProps: (current: number, pageSize: number) => void;
  current: number;
  pageSize: number;
  dashboardUserData: IDashboardUserData;
} & WrappedComponentProps;
type IBindSubAaccountState = {
  selectAccount: [];
  selectSub: string[];
  switchTrade: boolean;
  switchWithdraw: boolean;
  loadding: boolean;
  tfa: boolean;
  tfaCode: string;
};
export class BindSubAaccount extends Component<
  IBindSubAaccountProps,
  IBindSubAaccountState
> {
  constructor(props: IBindSubAaccountProps) {
    super(props);
    this.state = {
      selectAccount: [],
      selectSub: [],
      switchTrade: false,
      switchWithdraw: false,
      loadding: false,
      tfa: false,
      tfaCode: "",
    };
  }
  componentDidMount() {
    getSubAccount(this.props.AccountProps.loginId).then((res) => {
      if (res.code === "0000") {
        this.setState({ selectAccount: res.data });
      } else {
        message.error(res.message);
      }
    });
  }

  handleChange = (value: string[]) => {
    this.setState({ selectSub: value });
  };
  switch = (e: any, checked: boolean) => {
    if (e === "Trade") {
      this.setState({ switchTrade: checked });
    } else {
      this.setState({ switchWithdraw: checked });
    }
  };
  submit = () => {
    if (
      this.props.dashboardUserData.enableTfa &&
      this.props.dashboardUserData.tfaProtected.isLoginAndManagement
    ) {
      this.setState({ tfa: true });
    } else {
      this.bindSubAaccount();
    }
  };
  bindSubAaccount = (e?: string) => {
    const { switchTrade, switchWithdraw, selectSub } = this.state;
    this.setState({ loadding: true });
    AddBind(
      {
        accountID: this.props.AccountProps.loginKey,
        canTrade: switchTrade,
        canWithdraw: switchWithdraw,
        subAccountId: selectSub,
      },
      e
    ).then((res) => {
      this.setState({ loadding: false });
      if (res.code === "0000") {
        this.props.hanlderProps(this.props.current, this.props.pageSize);
        this.props.cancleHandler();
      } else {
        message.error(res.message);
      }
    });
  };
  tfaCallback = (e: string) => {
    this.setState({ tfaCode: e }, () => {
      this.bindSubAaccount(e);
    });
  };
  tfaShowModal = (e: boolean) => {
    this.setState({ tfa: e });
    if (e === false) {
      this.setState({ loadding: false });
    }
  };
  render() {
    const {
      selectAccount,
      switchTrade,
      // switchWithdraw,
      selectSub,
      loadding,
      tfa,
    } = this.state;
    return (
      <Modal
        className="bindSubAaccount-model"
        title={
          <div>
            <p>
              <FormattedMessage
                id="Bind_Subaccount"
                defaultMessage="Bind Subaccount"
              />
            </p>
            <span
              style={{
                fontSize: "16px",
                marginTop: "6px",
                marginRight: "111px",
                lineHeight: "19px",
                fontFamily: "inherit",
                fontWeight: 400,
              }}
            >
              {this.props.AccountProps.userName}
            </span>
          </div>
        }
        visible
        closable={true}
        footer={null}
        maskClosable={false}
        onCancel={this.props.cancleHandler}
      >
        <div className="bindSubAaccount-content">
          <p>
            <FormattedMessage id="Permission" defaultMessage="Permission" />
          </p>
          <div className="bindSubAaccount-switch">
            <span>
              <FormattedMessage id="Can_Trade" defaultMessage="Can Trade" />
            </span>
            <Switch
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
          <p>
            <FormattedMessage id="SubAccount" defaultMessage="Sub-account" />
          </p>
          <Select
            mode="multiple"
            size="large"
            placeholder={
              <FormattedMessage
                id="Add_Sub_Account"
                defaultMessage="Add Sub-Account"
              />
            }
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
          className="bindSubAaccount-btn"
          onClick={this.submit}
          loading={loadding}
          disabled={selectSub.length === 0}
          style={{ background: selectSub.length === 0 ? "#ADB1BB" : "" }}
        >
          <FormattedMessage id="Submit" defaultMessage="Submit" />
        </Button>
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

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(BindSubAaccount);
