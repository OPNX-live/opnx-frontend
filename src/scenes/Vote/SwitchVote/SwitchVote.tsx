import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, message, Button } from "antd";
import {
  setAccountName,
  setUser,
  setDashboardUserData,
} from "../../../store/actions/publicAction";
import { SwitchAccout, UserData } from "../../../service/http/http";
import "./SwitchVote.scss";
import { messageError } from "../../../utils";
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
type ISwitchVotePropsState = ReturnType<typeof mapStateToProps> &
  ISwitchVoteDispatchState &
  WrappedComponentProps;
type ISwitchVoteDispatchState = ReturnType<typeof mapDispatchToProps>;
class SwitchVote extends Component<
  IPorps & ISwitchVotePropsState,
  ISwitchState
> {
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
  };
  render() {
    const { intl, visable } = this.props;
    const { loading } = this.state;
    return (
      <Modal
        title={intl.formatMessage({ id: "Switch_account" })}
        visible={visable}
        footer={
          <div className="vote-model-btn">
            <Button
              type="text"
              onClick={() => {
                this.props.onCloseModel(false);
              }}
            >
              {intl.formatMessage({ id: "Cancel" })}
            </Button>
            <Button type="primary" loading={loading} onClick={this.onSwitch}>
              {intl.formatMessage({ id: "Switch to vote" })}
            </Button>
          </div>
        }
        closable={false}
        maskClosable={false}
        className="switch-vote"
        onCancel={() => {
          this.props.onCloseModel(false);
        }}
      >
        <div className="idebtity-top">
          {intl.formatMessage({ id: "Current_account" })}:
          <span>{this.props.users.accountName}</span>
        </div>
        <div className="idebtity-bottom">
          {intl.formatMessage({ id: "switch_main" })}
        </div>
        {/* <div className="goit">
          <div onClick={this.onSwitch}>
            Switch to vote
          </div>
        </div> */}
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
)(injectIntl(SwitchVote));
