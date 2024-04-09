import React, { Component } from "react";
import { connect } from "react-redux";
import DashboardHeaher from "./components/dashboardHeader/dashboardHeaher";
import DashboardBottom from "./components/dashboardBottom/dashboardBottom";
import BalanceDetails from "./components/balanceDetails/balancedetails";
import { UserData } from "service/http/http";
import { message, Col, Row } from "antd";
import messageError from "utils/errorCode";
import { Loadding } from "components/loadding";
import {
  setDashboardUserData,
  switchLoginActiveTab,
  setIsLogin,
} from "store/actions/publicAction";
// import { FeeSchedule } from "router/configRouter";
import { Securitycomponent } from "scenes/home/router/configRouter";
import EarnRote from "./components/EarnRote/EarnRote";
import AccountSecurity from "./components/accountSecurity/AccountSecurity";

type IDashboard = {
  userData: IDashboardUserData | undefined;
  waring: boolean;
};
type IDashboardDispatchProps = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
export class Dashboard extends Component<IDashboardDispatchProps, IDashboard> {
  constructor(props: IDashboardDispatchProps) {
    super(props);
    this.state = { userData: undefined, waring: false };
  }
  componentDidMount() {
    Securitycomponent.preload();
    this.getUserData();
  }

  getUserData = async () => {
    const response = await UserData();
    if (response) {
      if (response && response.code === "0000") {
        this.setState({ userData: response.data });
        this.props.setIsLogin(response.success);
        this.props.setDashboardUserData(response.data);
      } else {
        message.error(messageError(response.code));
        this.props.switchLoginActiveTab("login");
        window.location.href = "/login";
      }
    }
  };
  UNSAFE_componentWillReceiveProps(nextProps: IDashboardDispatchProps) {
    if (
      this.props.user.token !== nextProps.user.token &&
      nextProps.user.token
    ) {
      this.getUserData();
    }
  }
  hanlderWarning = (e: boolean) => {
    this.setState({ waring: e });
  };
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <Loadding show={this.state.userData ? 0 : 1}>
          {this.state.userData && (
            <>
              <DashboardHeaher
                waring={this.state.waring}
                userData={this.state.userData!}
              />
              <Row
                gutter={{ xs: 0, xl: 12 }}
                style={{ marginRight: "0px", marginLeft: "0", width: "100%" }}
              >
                <Col xl={16} xs={24} style={{ paddingLeft: "0" }}>
                  <BalanceDetails userData={this.state.userData!} />
                </Col>
                <Col xl={8} xs={24} style={{ paddingRight: "0" }}>
                  <EarnRote />
                  <AccountSecurity
                    hanlderWarning={this.hanlderWarning}
                    userData={this.state.userData!}
                  />
                </Col>
              </Row>
              <DashboardBottom
                hanlderWarning={this.hanlderWarning}
                userData={this.state.userData!}
              />
              {/* <ProgressComponent type={"dashboard"} /> */}
            </>
          )}
        </Loadding>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  user: state.users,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    },
    setIsLogin(i: boolean) {
      dispatch(setIsLogin(i));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
