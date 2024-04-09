import React, { Component } from "react";
import { connect } from "react-redux";
import "./RewardCenter.scss";
import { setDashboardUserData } from "store/actions/publicAction";
import { WrappedComponentProps, injectIntl } from "react-intl";
import Reward from "./components/Reward/Reward";
import { switchValue } from "../history/component/exportHistory/data";

interface IState {
  initDate: any;
}

interface IProps {
  activeKey: string;
}

type IRewardCenterPropsState = ReturnType<typeof mapStateToProps>;
type IRewardCenterDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IRewardCenterPropsState &
  WrappedComponentProps;
class RewardCenter extends Component<IRewardCenterDispatchState, IState> {
  constructor(props: IRewardCenterDispatchState) {
    super(props);
    this.state = {
      initDate: switchValue("1w")
    };
  }
  render() {
    return (
      <div className="rewardCenter">
        <div className="rewardCenter-title">
          {this.props.intl.formatMessage({
            id: "Reward Center",
            defaultMessage: "Reward Center"
          })}
        </div>
        <Reward
          initDate={(e) => {
            this.setState({
              initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`]
            });
          }}
        />
      </div>
    );
  }
}
const mapStateToProps = (state: {
  dashboardUserData: IDashboardUserData;
  users: Iusers;
}) => {
  return {
    dashboardUserData: state.dashboardUserData,
    users: state.users
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RewardCenter));
