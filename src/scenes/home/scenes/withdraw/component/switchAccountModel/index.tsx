import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, message } from "antd";
import {
  setAccountName,
  setUser,
  setDashboardUserData,
} from "store/actions/publicAction";
import { SwitchAccout, UserData } from "service/http/http";
import "./index.scss";
import { messageError } from "utils";
import { injectIntl, WrappedComponentProps } from "react-intl";
interface IPorps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
}
interface IPropsState {
  subAccounts: IAllAccout[];
  dashboardUserData: IDashboardUserData;
  users: Iusers;
}
interface ISwitchState {
  loading: boolean;
}
type ISwitchModelPropsState = ReturnType<typeof mapStateToProps> &
  ISwitchModelDispatchState &
  WrappedComponentProps;
type ISwitchModelDispatchState = ReturnType<typeof mapDispatchToProps>;
class SwitchModel extends Component<IPorps & ISwitchModelPropsState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  onSwitch = () => {
    this.setState({ loading: true });
    const account: IAllAccout[] = this.props.subAccounts.filter(
      (i: IAllAccout) => i.accounts.isMainAccount
    );
    if (account && account.length > 0 && account[0].accounts) {
      SwitchAccout(account[0].accounts.accountId).then((res) => {
        if (res.success) {
          // const data: Iusers = {
          //   email: res.data.email,
          //   token: res.data.token,
          //   accountName: res.data.accountName,
          //   mainLogin: res.data.mainLogin,
          //   loginId: res.data.loginId,
          // };
          this.props.setUser(res.data);
          this.props.onCloseModel(false);
          UserData().then((res) => {
            if (res.code === "0000") {
              this.props.setDashboardUserData(res.data);
              this.props.onCloseModel(false);
            } else {
              message.error(res.message);
            }
            setTimeout(() => {
              this.setState({ loading: false });
              window.location.reload();
            }, 1000);
          });
        } else {
          this.setState({ loading: false });
          message.error(res.message);
        }
      });
    } else {
    }
  };
  render() {
    const { intl } = this.props;
    return (
      <Modal
        title={intl.formatMessage({ id: "Switch_account" })}
        visible={true}
        footer={null}
        closable={false}
        maskClosable={false}
        className="switch-model"
        getContainer={() => document.getElementById("withdraw")!}
        onCancel={() => {
          this.props.onCloseModel(false);
        }}
      >
        <div className="idebtity-top">
          {intl.formatMessage({ id: "Current_account" })}:
          <span>{this.props.users.accountName}</span>
        </div>
        <div className="idebtity-bottom">
          {intl.formatMessage({ id: "account_model_message" })}
        </div>
        <div className="goit">
          <div onClick={this.onSwitch}>
            {intl.formatMessage({ id: "model_btn" })}
          </div>
        </div>
      </Modal>
    );
  }
}
const mapStateToProps = (state: IPropsState) => {
  return {
    subAccounts: state.subAccounts,
    dashboardUserData: state.dashboardUserData,
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setAccountName(data: string) {
      dispatch(setAccountName(data));
    },
    setUser(data: Iusers) {
      dispatch(setUser(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SwitchModel));
