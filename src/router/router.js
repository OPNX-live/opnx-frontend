import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { RouterComponents } from "./configRouter";
import { HomeRouterComponents } from "scenes/home/router/configRouter";
// import store from "store/index";
import history from "./history";
import { setTitle } from "./data";
import NoPage from "scenes/404/404";
import Home from "scenes/home/home";
import { connect } from "react-redux";
import { setIsLogin, setUser, setDashboardUserData } from "store/actions/publicAction";
import { injectIntl } from "react-intl";
import { initEthereum } from "utils/checkMetamask";
import debounce from "lodash/debounce";
import pubsub from "pubsub-js";
import { BANNER } from "@opnx-pkg/uikit";

let unListen;
class Routers extends Component {
  requireAuth = (auth) => {
    //  if(auth.isLogin){
    //  console.log(auth.component)
    //  }
  };

  updateBanner = debounce(
    () => {
      pubsub.publish(BANNER.EVENT, BANNER.REQUEST);
    },
    50,
    {
      leading: true,
      trailing: false,
    }
  );
  componentDidMount() {
    // let state = store.getState();
    document.title = setTitle(RouterComponents.concat(HomeRouterComponents))
      ? setTitle(RouterComponents.concat(HomeRouterComponents)) + " | Open Exchange"
      : "Open Exchange";
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/user" ||
      window.location.pathname === "/user/"
    ) {
      history.replace("/home");
    }
    unListen = history.listen((i) => {
      this.updateBanner();
      document.title = setTitle(RouterComponents.concat(HomeRouterComponents))
        ? setTitle(RouterComponents.concat(HomeRouterComponents)) + " | Open Exchange"
        : "Open Exchange";
    });
    if (
      this.props.loginActiveTab === "metaMaskLogin" &&
      this.props.dashboardUserData &&
      (this.props.dashboardUserData.accountSource === "METAMASK" || this.props.dashboardUserData.publicAddress)
    ) {
      initEthereum();
    }
    // initEthereum\
  }
  componentWillUnmount() {
    unListen();
  }
  render() {
    return (
      <Switch>
        {RouterComponents.map((item) => {
          return (
            <Route
              key={item.name}
              path={item.path}
              exact={item.exact}
              component={item.component}
              onEnter={this.requireAuth(item)}
            />
          );
        })}
        <Route path="/home" component={Home} />
        <Route path="*" component={NoPage} />
      </Switch>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    dashboardUserData: state.dashboardUserData,
    loginActiveTab: state.loginActiveTab,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    async setUser(data, type) {
      const res = await dispatch(setUser(data, type));
      return Promise.resolve(res);
    },
    setIsLogin(i) {
      dispatch(setIsLogin(i));
    },
    setDashboardUserData(data) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Routers));
