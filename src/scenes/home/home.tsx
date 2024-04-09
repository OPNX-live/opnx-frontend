import React from "react";
import { connect } from "react-redux";
import { Layout, Menu, Tooltip } from "antd";
// import { Login } from "router/configRouter";
import HomeRouters from "./router/router";
import history from "router/history";
// import MobileHome from "./components/mobileTabLeft";
import {
  imageList,
  tabRouter,
  exactPath,
  tabWalletRouter,
  IsPC,
  mobileFilter,
} from "./data";
import { LoginManagement, SubAccout } from "./router/configRouter";
import {
  setDashboardUserData,
  setKycInfo,
  setSubAccouts,
  setTfaList,
  setWallet,
} from "store/actions/publicAction";
import "./home.scss";
import { NavLink } from "react-router-dom";
import { whiteList, hintMessage, localStorage } from "utils";
import { sendMessage } from "service/webScoket/config";
import { LeftOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { tfaRemind, UserData } from "service/http/http";
import { debounce } from "lodash";
import { createPortal } from "react-dom";
import store from "store";
import { DOMAIN } from "@opnx-pkg/uikit";

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

type IHomePropsState = ReturnType<typeof mapStateToProps>;
type IHomeDispatchState = ReturnType<typeof mapDispatchToProps>;
type IHomeState = {
  isMobile: boolean;
  menuItem: string;
  isSubMenu: boolean;
  scroll: string;
  broken: boolean;
  collapsed: boolean;
  registerRemind: boolean;
  securityRemind: boolean;
  depositRemind: boolean;
  setDashboardUserDataCount: number;
};
const imageItem = imageList as any;
export class Home extends React.PureComponent<
  IHomePropsState & IHomeDispatchState,
  IHomeState
> {
  private unListenr: any;
  private unSubscribe: any;
  constructor(props: any) {
    super(props);
    this.state = {
      isMobile: false,
      menuItem: window.location.pathname,
      isSubMenu: false,
      scroll: "66px",
      broken: false,
      collapsed: false,
      registerRemind: localStorage.get("registerRemind") || false,
      securityRemind: localStorage.get("securityRemind") || false,
      depositRemind: false,
      setDashboardUserDataCount: 0,
    };
  }
  dashBoardRefresh = async () => {
    const response = await UserData();
    if (response) {
      if (response && response.code === "0000") {
        this.props.setDashboardUserData(response.data);
      }
      // console.log(response);
    }
  };
  async componentDidMount() {
    if (this.props.users.token) {
      this.props.setTfaList();
      this.dashBoardRefresh();
      this.props.setKycInfo();
    }
    this.remindRegister();
    if (this.props.users.token) {
      // Login.preload();
      LoginManagement.preload();
      SubAccout.preload();
      this.props.setSubAccouts();
    } else {
    }
    document.getElementById("root")?.addEventListener(
      "scroll",
      debounce((e: any) => {
        if (e?.target?.scrollTop > 60) {
          this.setState({ scroll: "0px" });
        } else {
          this.setState({ scroll: "66px" });
        }
      }, 200)
    );
    window.addEventListener(
      "resize",
      debounce((e: any) => {
        if (e.currentTarget?.innerWidth < 768) {
          this.setState({ isMobile: true, collapsed: true });
        } else {
          this.setState({ isMobile: false, collapsed: false });
        }
      }, 200)
    );
    sendMessage.init();
    const isPc = IsPC();
    this.setState({ collapsed: !isPc, isMobile: !isPc });
    this.exactMenuItem(window.location.pathname);
    this.unListenr = history.listen((action, cc) => {
      this.exactMenuItem(action.pathname);
      const pathName = action.pathname;
      if (
        pathName === "/home/walletManagement/balance" ||
        pathName === "/home/walletManagement/deposit"
      ) {
        this.depositRemind();
      }
    });

    this.unSubscribe = store.subscribe(() => {
      const newStore = store.getState();
      if (
        !newStore.users?.token &&
        this.state.setDashboardUserDataCount === 0
      ) {
        this.setState({ setDashboardUserDataCount: 1 });
        this.props.setDashboardUserData({} as IDashboardUserData);
      }
    });
  }
  depositRemind = () => {
    const { dashboardUserData } = this.props;
    if (
      dashboardUserData.accountSource === "METAMASK" &&
      !dashboardUserData.bindEmail
    ) {
      return;
    }
    tfaRemind("TFA_DEPOSIT_REMIND").then((res) => {
      if (res.success) {
        if (res.data) {
          hintMessage();
        }
      }
    });
  };
  remindRegister = async () => {
    const { dashboardUserData } = this.props;
    if (
      !dashboardUserData.loginName ||
      (dashboardUserData.accountSource === "METAMASK" &&
        !dashboardUserData.bindEmail)
    ) {
      return;
    }
  };
  componentWillUnmount() {
    this.unListenr();
    this.unSubscribe();
    window.removeEventListener("resize", () => {});
    window.removeEventListener("storage", () => {});
  }
  exactMenuItem = (path: string) => {
    if (
      path.search("/home/walletManagement") === -1 &&
      path.search("/home/flexAsset") === -1 &&
      path.search("/home/rewardCenter") === -1 &&
      path.search("/home/ammHistory") === -1
    ) {
      // 监听用户如果是输入的url；二级导航丢失问题；
      this.props.setWallet(false);
    } else {
      this.props.setWallet(true);
    }
  };
  UNSAFE_componentWillReceiveProps(nextProps: any, nextState: IHomeState) {
    if (window.location.pathname !== nextState.menuItem) {
      this.setState({ menuItem: window.location.pathname });
    }
    if (
      this.props.users.token !== nextProps.users.token &&
      nextProps.users.token
    ) {
      this.dashBoardRefresh();
    }
  }
  router = (link: any, e: any) => {
    const path = e.item.props["data-value"];
    if (link) {
      window.location.href = process.env.REACT_APP_OPNX + link;
    } else {
      history.push(path);
      this.setState({ menuItem: path });
    }
  };
  setSubMenu = () => {
    this.setState({ isSubMenu: !this.state.isSubMenu });
  };
  renderItem = (item: any, OpenKey: string) => {
    return (
      <Menu.Item
        key={`${process.env.REACT_APP_ROUTER} ${item.key}`}
        onClick={this.router.bind(this, item?.link)}
        data-value={`${item.key}`}
        icon={
          item.key === "/home/pairEmail" ? (
            <UsergroupAddOutlined
              style={{ color: "#e5dff5" }}
              className="home-Dashboard"
            />
          ) : (
            <img
              className="home-Dashboard"
              src={
                OpenKey === process.env.REACT_APP_ROUTER + item.key
                  ? imageItem[item.title.replace(" ", "") + "Active"]
                  : imageItem[item.title.replace(" ", "")]
              }
              alt={item.name}
            />
          )
        }
      >
        {!item.link ? (
          <NavLink
            to={item.key}
            style={{
              color:
                OpenKey === process.env.REACT_APP_ROUTER + item.key
                  ? "#318BF5"
                  : "",
            }}
          >
            {item.name}
          </NavLink>
        ) : (
          <a
            href={process.env.REACT_APP_OPNX + item.link}
            style={{
              color:
                OpenKey === process.env.REACT_APP_ROUTER + item.key
                  ? "#318BF5"
                  : " rgb(229, 223, 245)",
            }}
          >
            {item.name}
          </a>
        )}
      </Menu.Item>
    );
  };
  fiflter = (list: any) => {
    if (
      process.env.REACT_APP_TEMPORARY_OFF === "true" ||
      whiteList(this.props.dashboardUserData.accountId)
    ) {
      return list;
    } else {
      list[0].content = list[0].content.filter(
        (i: any) =>
          i.key !== "/home/walletManagement/deposit" &&
          i.key !== "/home/walletManagement/withdraw"
      );
      return list;
    }
  };

  nonUsUserFiflter = (list: any, isMainAccount: boolean) => {
    const res: any = [];
    list.forEach((item: any) => {
      if (item.key !== "/home/KYC") {
        if (item.content && item.content.length > 0) {
          const conetnt: any = [];
          item.content.forEach((el: any) => {
            conetnt.push(el);
          });
          item.content = conetnt;
        }
        res.push(item);
      }
    });
    return res;
  };

  usUserFiflter = (list: any, isMainAccount: boolean) => {
    const res: any = [];
    list.forEach((item: any) => {
      if (isMainAccount && item.key === "/home/KYC") {
        res.push(item);
      } else if (item.key !== "/home/KYC") {
        if (item.content && item.content.length > 0) {
          const conetnt: any = [];
          item.content.forEach((el: any) => {
            conetnt.push(el);
          });
          item.content = conetnt;
        }
        res.push(item);
      }
    });
    return res;
  };
  metamaskFiflter = (list: any) => {
    const res: any = [];
    list.forEach((item: any) => {
      if (item.content && item.content.length > 0) {
        const conetnt: any = [];
        item.content.forEach((el: any) => {
          if (el.key !== "/home/loginManagement") {
            conetnt.push(el);
          }
        });
        item.content = conetnt;
      }
      res.push(item);
    });
    return res;
  };
  render() {
    const { broken, collapsed, scroll, isMobile } = this.state;
    const { users, wallet, dashboardUserData } = this.props;
    let renderList = wallet
      ? mobileFilter(this.fiflter(tabWalletRouter), isMobile)
      : mobileFilter(tabRouter, isMobile);
    if (
      dashboardUserData &&
      dashboardUserData.accountSource === "METAMASK" &&
      !dashboardUserData.isMainAccount
    ) {
      renderList = this.metamaskFiflter(renderList);
    }

    // if (dashboardUserData && dashboardUserData.sourceType !== "US") {
    //   renderList = this.nonUsUserFiflter(renderList, dashboardUserData.isMainAccount);
    // } else {
    //   renderList = this.usUserFiflter(renderList, dashboardUserData.isMainAccount);
    // }
    const [OpenKey, seletctKey] = exactPath(renderList, wallet);
    let styleSider: any;
    if (!broken) {
      styleSider = {
        overflowY: "scroll",
        height: "100vh",
        position: "fixed",
        left: 0,
        zIndex: 100,
      };
    }
    return (
      <div className="home" id="home">
        <Layout>
          {isMobile && !collapsed
            ? createPortal(
                <div
                  style={{ opacity: collapsed ? 0 : 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ collapsed: true });
                  }}
                  className="home-mask"
                ></div>,
                document.body
              )
            : null}
          <Sider
            collapsedWidth={0}
            breakpoint="xxl"
            style={styleSider}
            onBreakpoint={(broken) => {
              this.setState({ broken });
            }}
            trigger={collapsed ? <LeftOutlined /> : null}
            collapsed={collapsed}
            onCollapse={(e, c) => {
              if (c === "clickTrigger") {
                this.setState({ collapsed: e });
              }
            }}
          >
            <Menu
              mode="inline"
              className="home-tab"
              defaultSelectedKeys={[
                window.location.pathname === "/"
                  ? "/home"
                  : window.location.pathname,
              ]}
              defaultOpenKeys={[OpenKey]}
              openKeys={
                !isMobile
                  ? [
                      "/user/home/advanced",
                      "/user/home/walletManagement",
                      "/user/home/order",
                      "/user/home/flexAsset",
                      "/user/home/ammHistory",
                    ]
                  : undefined
              }
              selectedKeys={[seletctKey]}
              style={{
                borderRight: 0,
                height: "100%",
                overflowY: "scroll",
                paddingBottom: 48,
                // position: "fixed",
                // width: "200px",
                // top: scroll,
                // height: "90vh",
                // transition: "top 0.2s",
                // zIndex: 100,
                // overflowY: "scroll",
                // overflowX:"hidden"
              }}
            >
              {renderList.map((item: any) => {
                return item.children &&
                  (users.mainLogin ||
                    item.key === "/home/walletManagement" ||
                    item.key === "/home/order" ||
                    item.key === "/home/flexAsset" ||
                    item.key === "/home/ammHistory") ? (
                  <SubMenu
                    key={process.env.REACT_APP_ROUTER + item.key}
                    onTitleClick={this.setSubMenu}
                    title={
                      <span
                        style={{
                          color:
                            OpenKey === process.env.REACT_APP_ROUTER + item.key
                              ? "#318BF5"
                              : "",
                        }}
                      >
                        {item.name}
                      </span>
                    }
                    icon={
                      <img
                        className="home-Dashboard"
                        src={
                          OpenKey === process.env.REACT_APP_ROUTER + item.key
                            ? imageItem[item.title.replace(" ", "")]
                            : imageItem[item.title.replace(" ", "") + "Active"]
                        }
                        alt="Dashboard"
                      ></img>
                    }
                  >
                    {item.content!.map((i: any) => {
                      return this.props.dashboardUserData.copperAccount &&
                        (i.title === "Sub-account" ||
                          i.title === "Login Management") ? null : (
                        <Menu.Item
                          key={process.env.REACT_APP_ROUTER + i.key}
                          onClick={this.router.bind(this, "")}
                          data-value={i.key}
                          style={{
                            display: users.mainLogin
                              ? "block"
                              : i.key === "/home/walletManagement/withdraw" ||
                                i.key === "/home/walletManagement/transfer"
                              ? "none"
                              : "",
                          }}
                        >
                          <span
                            className={
                              process.env.REACT_APP_ROUTER + i.key !==
                              seletctKey
                                ? "ant-menu-item-raidus"
                                : "ant-menu-item-raidus-active"
                            }
                          ></span>{" "}
                          <NavLink to={i.key}>{i.name}</NavLink>
                        </Menu.Item>
                      );
                    })}
                  </SubMenu>
                ) : item.title !== "Advanced" ? (
                  this.renderItem(item, seletctKey)
                ) : users.mainLogin ? (
                  this.renderItem(item, seletctKey)
                ) : null;
              })}
            </Menu>
          </Sider>
          <Layout>
            <Content
              className="site-layout-background"
              style={{
                padding: "12px",
                margin: 0,
                minHeight: 280,
                marginLeft: broken ? 0 : "200px",
              }}
            >
              <HomeRouters />
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  wallet: state.wallet,
  isLogin: state.isLogin,
  dashboardUserData: state.dashboardUserData,
  tfaList: state.tfaList,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setWallet(data: boolean) {
      dispatch(setWallet(data));
    },
    setTfaList() {
      dispatch(setTfaList());
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
    setKycInfo() {
      dispatch(setKycInfo());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
