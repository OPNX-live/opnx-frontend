import React, { Component } from "react";
import { Route, Switch, withRouter } from "react-router-dom";
import { HomeRouterComponents } from "./configRouter";
import history from "../../../router/history";
import store from "../../../store/index";
import NoPage from "scenes/404/404";
import { connect } from "react-redux";
import { whiteList } from "utils/utils";
import { DOMAIN } from "@opnx-pkg/uikit";
class HomeRouters extends Component {
  routerIsLogin = () => {
    let state = store.getState();
    const pathName = window.location.pathname;
    if (!state.users.mainLogin) {
      if (
        pathName === process.env.REACT_APP_ROUTER + "/home/apiManagement" ||
        pathName === process.env.REACT_APP_ROUTER + "/home/loginManagement" ||
        pathName === process.env.REACT_APP_ROUTER + "/home/subAccount" ||
        pathName ===
          process.env.REACT_APP_ROUTER + "/home/walletManagement/withdraw" ||
        pathName ===
          process.env.REACT_APP_ROUTER + "/home/walletManagement/transfer"
      ) {
        history.replace("/home");
      }
    }
    // if (!state.isLogin) {
    //   history.replace("/login");
    // }
    if (!whiteList(store.getState().dashboardUserData.accountId)) {
      if (!process.env.REACT_APP_TEMPORARY_OFF === "true") {
        switch (pathName) {
          case process.env.REACT_APP_ROUTER + "/home/walletManagement/withdraw":
          case process.env.REACT_APP_ROUTER + "/home/walletManagement/deposit":
            history.replace("/home");
            break;
          default:
            break;
        }
      }
    }
  };
  /*
    Dashboard /home
    LoginManagement /home/loginManagement
    Sub-account /home/subAccount
    ApiManagement /home/apiManagement
    Security /home/security
    Google 2FA /home/security/google_2fa
    Authy 2FA /home/security/authy_2fa
    YubiKey 2FA /home/security/youbikey_2fa
    Balance /home/walletManagement/balance
    Position /home/walletManagement/position
    Deposit /home/walletManagement/deposit
    Transfer /home/walletManagement/transfer
    History /home/walletManagement/history
    Withdraw /home/walletManagement/withdraw
    AddressManagement /home/security/addressManagement
    TradeHistory /home/walletManagement/TradeHistory
    FlexAssetHistory /home/flexAsset/flexAssetHistory
    FlexAssets /home/flexAsset/flexAssetsBorrow
    SettlementHistory /home/walletManagement/SettlementHistory
    KYC /home/KYC
    pairEmail /home/pairEmail

     /home/KYC || /home/loginManagement
   */
  componentDidMount() {
    this.routerIsLogin();
  }
  render() {
    return (
      <Switch>
        {HomeRouterComponents.map((item) => {
          if (
            this.props.dashboardUserData.copperAccount &&
            (item.name === "Sub-account" || item.name === "LoginManagement")
          ) {
            return null;
          } else {
            return (
              <Route
                key={item.name}
                path={item.path}
                exact={item.exact}
                component={item.component}
              />
            );
          }
        })}
        <Route path="/home/*" component={NoPage} />
      </Switch>
    );
  }
}
const mapStateToProps = (state) => ({
  dashboardUserData: state.dashboardUserData,
});
export default withRouter(connect(mapStateToProps)(HomeRouters));
