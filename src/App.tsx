import React from "react";
import { ConfigProvider, Layout } from "antd";
import { connect } from "react-redux";
import Routers from "./router/router";
import { RouteProps, Router } from "react-router-dom";
import ConnectedIntlProvider from "./components/ConnectedIntlProvider/index";
import {
  setUser,
  setIsLogin,
  setSwitchLanguage,
  switchLoginActiveTab,
  setDashboardUserData,
} from "store/actions/publicAction";
import { localStorage } from "utils";
import history from "router/history";
import TopHeader from "scenes/home/components/uiHeader/TopHeader";
import zhCN from "antd/es/locale-provider/zh_CN";
import moment from "moment"; // 在原有的基础上加上下面三行代码
import "moment/locale/zh-cn";
import {
  PLATFORM,
  Provider,
  RecaptchaProvider,
  ThemeProvider,
  IntercomProvider,
  OPNX,
} from "@opnx-pkg/uikit";
import "utils/listenStorage";
import { loginOut401 } from "utils/loginOut";
import Banner from "components/Banner/Banner";
import BigNumber from "bignumber.js";
import "./style/App.scss";

moment.locale("zh-cn");
const { Header, Content } = Layout;
type IAppPropsDispatch = ReturnType<typeof mapDispatchToProps>;
type IAppProps = ReturnType<typeof mapStateToProps>;

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});
class App extends React.Component<RouteProps & IAppPropsDispatch & IAppProps> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  private unListenr: any;
  private count = 0;
  componentWillMount() {
    if (localStorage.get("language")) {
      this.props.setSwitchLanguage(localStorage.get("language"));
      return;
    }
    localStorage.set("language", this.props.SwitchLanguage || "en");
    this.props.setSwitchLanguage(localStorage.get("language"));
  }
  async componentDidMount() {
    const prevUser = localStorage.get("user");
    if (prevUser) {
      if (prevUser.token !== this.props.users.token) {
        this.props.setUser(prevUser);
        this.props.setIsLogin(true);
      }
    } else {
      this.props.setUser("");
      this.props.setIsLogin(false);
      this.props.setDashboardUserData({} as IDashboardUserData);
    }
    const that = this;
    window.addEventListener("setItemEvent", function (e: any) {
      const l = e.target.localStorage;
      setTimeout(() => {
        if (
          e.key === "user" &&
          e.newValue === "null" &&
          e.oldValue &&
          (!l?.user || JSON.parse(l?.user) === null)
        ) {
          loginOut401();
        }
        if (
          e.key === "user" &&
          e.newValue !== "null" &&
          Boolean(JSON.parse(e.oldValue))
        ) {
          const newValue = JSON.parse(e?.newValue);
          const oldValue = JSON.parse(e.oldValue);
          if (newValue?.token !== oldValue?.token && newValue) {
            that.props?.setUser(newValue);
            window.location.reload();
          }
        }
      }, 200);
    });
    window.addEventListener("storage", async (e) => {
      try {
        const user = Boolean(e.storageArea?.user)
          ? JSON.parse(e.storageArea?.user || null)
          : false;
        const language: string = JSON.parse(e.storageArea?.language || null);
        if (this.props.SwitchLanguage !== language) {
          language && this.props.setSwitchLanguage(language);
        }
        if (user) {
          if (user.token !== this.props.users.token) {
            this.props.setIsLogin(true);
            const res = await Promise.all([this.props.setUser(user)]);
            if (res) {
              if (
                window.location.pathname === "/login" ||
                window.location.pathname === "/user/loginTfa"
              ) {
                history.replace("/home");
              } else {
                if (window.location.search.includes("?amm=")) {
                  window.history.replaceState(
                    null,
                    "",
                    window.location.origin + window.location.pathname
                  );
                }
              }
            }
          }
        } else if (
          this.props.isLogin === true &&
          (window.localStorage.getItem("user") === "null" ||
            window.localStorage.getItem("user") === '""')
        ) {
          this.props.setIsLogin(false);
          this.props.setUser("", "storage");
          this.props.switchLoginActiveTab("login");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
  componentWillUnmount() {
    window.removeEventListener("storage", (e) => {});
    window.removeEventListener("setItemEvent", (e) => {});
    this.unListenr && this.unListenr();
  }

  render() {
    return (
      <Router history={history as any}>
        <ConnectedIntlProvider>
          <ConfigProvider
            locale={this.props.SwitchLanguage === "zh" ? zhCN : undefined}
          >
            <Provider platform={PLATFORM.OPNX}>
              <ThemeProvider prefixCls={PLATFORM.OPNX} hardThemeMode="dark">
                  <OPNX.Cookies />
                  <IntercomProvider />
                  <RecaptchaProvider>
                    <div className="App">
                      <Layout>
                        {this.props.location?.pathname !== "/authorize" && (
                          <Header>
                            <TopHeader />
                          </Header>
                        )}
                        {/* <Banner /> */}
                        <Content>
                          <Routers />
                        </Content>
                      </Layout>
                    </div>
                  </RecaptchaProvider>
              </ThemeProvider>
            </Provider>
          </ConfigProvider>
        </ConnectedIntlProvider>
      </Router>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    users: state.users,
    isLogin: state.isLogin,
    SwitchLanguage: state.SwitchLanguage,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    async setUser(data: any, type?: string) {
      const res = await dispatch(setUser(data, type));
      return Promise.resolve(res);
    },
    setIsLogin(data: boolean) {
      dispatch(setIsLogin(data));
    },
    setSwitchLanguage(data: string) {
      dispatch(setSwitchLanguage(data));
    },
    switchLoginActiveTab(data: string) {
      dispatch(switchLoginActiveTab(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(App);
