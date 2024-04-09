import React, { Component } from "react";
import { connect } from "react-redux";
import { Tabs, Input, Table, message, Checkbox } from "antd";
import Tooltip from "components/TooltipGlobal/Tooltip";
import Show from "assets/image/show.svg";
import isShow from "assets/image/isShow.svg";
import FLEXAssets from "assets/image/flexassets.png";
import {
  tabSubAccount,
  SwitchAccout,
  UserData,
  InquireBalance,
  userBlance,
  getTodayPnl,
} from "service/http/http";
import {
  setDepositCoin,
  setUser,
  setWihdrawCoin,
} from "store/actions/publicAction";
import messageError from "utils/errorCode";
import {
  filterValue,
  filterUserBlance,
  filterHideSmall,
  dataSort,
} from "./data";
import { tradingType } from "../dashboard/components/dashboardBottom/data";
import { InquireBalanceType, IUserBalanceType } from "./type";
import { toThousands, toAccuracyNum, toCoinAccuracy } from "utils/calc";
import { Loadding } from "components/loadding";
import SearchCoin from "assets/image/searchCoin.svg";
import "./balance.scss";
import history from "router/history";
import { whiteList } from "utils";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
import { localStorage } from "utils/storage";
import { OPNX } from "@opnx-pkg/uikit";

const { Search } = Input;
const { TabPane } = Tabs;
type IBalanceState = {
  isEye: boolean;
  tabSubAccount: ITabSubAccount[] | [];
  userData: IDashboardUserData | undefined;
  InquireBalanceData: InquireBalanceType | undefined;
  userBlanceData: IUserBalanceType[] | [];
  storeUserBalance: IUserBalanceType[] | [];
  clickUserData: ITabSubAccount | undefined;
  isRepload: boolean;
  accountName: string;
  loadding: boolean;
  hideSmall: boolean;
  searchValue: string;
  pnl: string;
  isOpen: boolean;
};
type IBalanceDisplayProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  WrappedComponentProps;
export class Balance extends Component<IBalanceDisplayProps, IBalanceState> {
  constructor(props: IBalanceDisplayProps) {
    super(props);
    this.state = {
      isEye: false,
      tabSubAccount: [],
      userData: undefined,
      InquireBalanceData: undefined,
      userBlanceData: [],
      storeUserBalance: [],
      isRepload: true,
      accountName: "",
      clickUserData: undefined,
      loadding: false,
      hideSmall: localStorage.get("hideSmallBalance") || false,
      searchValue: "",
      pnl: "--",
      isOpen: false,
    };
  }
  componentDidMount() {
    this.initHttpData();
  }
  initHttpData = (id?: string) => {
    this.setState({ loadding: true });
    tabSubAccount().then((res) => {
      if (res.code === "0000") {
        const prevUserInfo = filterValue(
          res.data,
          this.props.users.accountName
        ) as ITabSubAccount;
        this.setState({ tabSubAccount: res.data, clickUserData: prevUserInfo });
      } else {
        message.error(res.message);
      }
    });
    getTodayPnl().then((res) => {
      this.setState({
        pnl: res.data
          ? res.data.todayPnl > 0
            ? `${res.data.todayPnl}`
            : res.data.todayPnl
          : "--",
      });
    });
    UserData()
      .then((res) => {
        if (res.code === "0000") {
          this.setState({ userData: res.data }, () => {
            InquireBalance(
              id ? id : (this.state.userData?.accountId as string)
            ).then((res) => {
              if (res.code === "0000") {
                this.setState({ InquireBalanceData: res.data });
              } else {
                message.error(res.message);
              }
            });
            userBlance(
              id ? id : (this.state.userData?.accountId as string)
            ).then((res) => {
              if (res.code === "0000") {
                this.setState({
                  userBlanceData: this.state.hideSmall
                    ? dataSort(filterHideSmall(res.data))
                    : dataSort(res.data),
                  loadding: false,
                  storeUserBalance: dataSort(res.data),
                });
              } else {
                message.error(res.message);
              }
            });
          });
        } else {
          message.error(res.message);
        }
      })
      .catch((err) => {});
  };
  updateEye = () => {
    const lastIsEye = this.state.isEye;
    this.setState({ isEye: !lastIsEye });
  };
  search = (e: string) => {
    if (e === "") {
      this.setState({
        userBlanceData: this.state.storeUserBalance,
      });
    } else {
      this.setState({
        userBlanceData: filterUserBlance(this.state.storeUserBalance, e),
      });
    }
    this.setState({ hideSmall: false });
  };
  tabClick = (e: string) => {
    if (e !== this.props.users.accountName || this.state.isRepload === false) {
      const prevUserInfo = filterValue(
        this.state.tabSubAccount,
        e
      ) as ITabSubAccount;
      this.setState({ clickUserData: prevUserInfo, loadding: true });
      if (prevUserInfo.isValid) {
        SwitchAccout(prevUserInfo.accountId).then(async (res) => {
          if (res.success) {
            // const data: Iusers = {
            //   email: res.data.email,
            //   token: res.data.token,
            //   accountName: res.data.accountName,
            //   mainLogin: res.data.mainLogin,
            //   loginId: res.data.loginId,
            // };
            const response = await this.props.setUser(res.data);
            if (response) {
              this.setState({
                isRepload: true,
                accountName: "",
                loadding: false,
              });
              this.initHttpData(prevUserInfo.accountId);
            }
            // setTimeout(() => {
            //   window.location.reload();
            // }, 1000);
          } else {
            message.error(res.message);
          }
        });
      } else {
        this.setState({
          isRepload: false,
          accountName: e,
          loadding: false,
        });
        this.initHttpData(prevUserInfo.accountId);
      }
    }
  };
  checkedPermissions = (canTrade: boolean, canWithdraw: boolean) => {
    if (canTrade && canWithdraw) {
      return this.props.intl.formatMessage({ id: "ALL" });
    } else if (canTrade) {
      return this.props.intl.formatMessage({ id: "Can_Trade" });
    }
    //  else if (canWithdraw) {
    //   return "Can Withdraw";
    // }
    else {
      return this.props.intl.formatMessage({ id: "Read-Only" });
    }
  };
  setCheckbox = (e: any) => {
    // console.log(e.target.checked);
    this.setState({ hideSmall: e.target ? e.target.checked : e });
    const checkbox = e.target ? e.target.checked : e;
    localStorage.set("hideSmallBalance", checkbox);
    if (checkbox) {
      this.setState({
        userBlanceData: filterHideSmall(this.state.userBlanceData),
      });
    } else {
      this.setState({
        userBlanceData: this.state.storeUserBalance,
        searchValue: "",
      });
      this.search("");
    }
  };
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const {
      isEye,
      tabSubAccount,
      userData,
      InquireBalanceData,
      userBlanceData,
      isRepload,
      accountName,
      clickUserData,
      loadding,
      hideSmall,
      searchValue,
      pnl,
      isOpen,
    } = this.state;
    const { users, intl } = this.props;
    const columns = [
      {
        title: <FormattedMessage id="Coin" />,
        dataIndex: "coin",
        showSorterTooltip: false,
        sorter: {
          compare: (a: any, b: any) => {
            return (
              a.coin.toLowerCase().charCodeAt() -
              b.coin.toLowerCase().charCodeAt()
            );
          },
        },
      },
      {
        title: <FormattedMessage id="Total_balance" />,
        dataIndex: "totalBalance",
        render: (_item: any) => {
          return (
            <p style={{ fontSize: "16px" }}>
              {!this.state.isEye
                ? toThousands(toAccuracyNum(_item))
                : "********"}
            </p>
          );
        },
      },
      {
        title: <FormattedMessage id="Available_balance" />,
        dataIndex: "availableBalance",
        render: (_item: any) => {
          return (
            <p style={{ fontSize: "16px" }}>
              {!this.state.isEye
                ? toThousands(toAccuracyNum(_item))
                : "********"}
            </p>
          );
        },
      },
      {
        title: <FormattedMessage id="Reserved" />,
        dataIndex: "reserved",
        render: (_item: any) => {
          return (
            <p style={{ fontSize: "16px" }}>
              {!this.state.isEye
                ? toThousands(toAccuracyNum(_item))
                : "********"}
            </p>
          );
        },
      },
      {
        title: "Locked",
        dataIndex: "locked",
        render: (_item: any) => {
          return (
            <p style={{ fontSize: "16px" }}>
              {!this.state.isEye
                ? toThousands(toAccuracyNum(_item))
                : "********"}
            </p>
          );
        },
      },
      {
        title: `${this.props.intl.formatMessage({ id: "Value" })} (${
          InquireBalanceData?.tradingType ? InquireBalanceData?.tradingType : ""
        })`,
        dataIndex: "value",
        showSorterTooltip: false,
        sorter: {
          compare: (a: any, b: any) => a.value - b.value,
        },
        render: (_item: any) => {
          return (
            <p style={{ fontSize: "16px" }}>
              {!this.state.isEye
                ? toThousands(toAccuracyNum(_item))
                : "********"}
            </p>
          );
        },
      },
      // {
      //   title: `${this.props.intl.formatMessage({ id: "Locked Balance" })}`,
      //   dataIndex: "locked",
      //   render: (_item: any) => {
      //     return (
      //       <p style={{ fontSize: "16px" }}>
      //         {!this.state.isEye
      //           ? _item
      //             ? toThousands(toAccuracyNum(_item))
      //             : "0"
      //           : "********"}
      //       </p>
      //     );
      //   }
      // },
      {
        title: <FormattedMessage id="Actions" />,
        dataIndex: "english",
        render: (_item: any, _record: any) => {
          return (
            <>
              {/* {userData?.isMainAccount ? <span>Deposit</span> : null} */}
              {/* <span
                // style={{
                //   color:
                //     clickUserData && !clickUserData.isValid
                //       ? "rgba(229,223,245,0.3)"
                //       : !userData?.permission.canTrade
                //       ? "rgba(229,223,245,0.3)"
                //       : ""
                // }}
                onClick={() => {
                  if (
                    process.env.REACT_APP_TEMPORARY_OFF === "true" ||
                    whiteList(this.props.dashboardUserData.accountId)
                  ) {
                    history.push({
                      pathname: "/home/walletManagement/deposit",
                      state: { coin: _record.coin },
                    });
                    this.props.setDepositCoin(_record.coin);
                  } else {
                    message.warn("COMMING SOON...");
                  }
                }}
              >
                <FormattedMessage id="Deposit" />
              </span> */}
              {userData?.isMainAccount && isRepload ? (
                <span
                  style={{
                    color:
                      clickUserData && !clickUserData.isValid
                        ? "rgba(229,223,245,0.3)"
                        : !userData?.permission.canWithdraw
                        ? "rgba(229,223,245,0.3)"
                        : "",
                  }}
                  onClick={() => {
                    if (
                      process.env.REACT_APP_TEMPORARY_OFF === "true" ||
                      whiteList(this.props.dashboardUserData.accountId)
                    ) {
                      history.push({
                        pathname: "/home/walletManagement/withdraw",
                        state: { coin: _record.coin },
                      });
                      this.props.setWithdrawCoin(_record.coin);
                    } else {
                      message.warn("COMMING SOON...");
                    }
                    // history.replace("/home");
                  }}
                >
                  <FormattedMessage id="Withdraw" />
                </span>
              ) : null}
              {/* {userData?.isMainAccount && isRepload ? ( */}
              <span
                onClick={() => {
                  history.push({
                    pathname: "/home/walletManagement/transfer",
                    state: { accountId: this.state.userData?.accountId },
                  });
                }}
              >
                <FormattedMessage id="Transfer" />
              </span>
              {_record.coin !== "USD" && (
                <span
                  onClick={() => {
                    window.open(
                      process.env.REACT_APP_MARKETS_URL +
                        "/" +
                        _record.coin +
                        "-USDT"
                    );
                  }}
                >
                  <FormattedMessage id="Trade" />
                </span>
              )}
              {/* {_record.coin === "USD" && (
                <span
                  onClick={() => {
                    window.open(process.env.REACT_APP_EARN);
                  }}
                >
                  <FormattedMessage id="Earn" />
                </span>
              )} */}
              {/* ) : null} */}
            </>
          );
        },
      },
    ] as any;
    return (
      <Loadding show={loadding ? 1 : 0}>
        <div className="balance">
          <div className="balance-top">
            <div className="balance-title">
              {this.props.intl.formatMessage({ id: "Balance" })}
            </div>
            <div className="balance-black"></div>
            <Tabs
              activeKey={isRepload ? users.accountName : accountName}
              style={{ height: 40 }}
              tabPosition="top"
              onTabClick={this.tabClick}
            >
              {[...tabSubAccount].map((i: ITabSubAccount, index: number) => (
                <TabPane
                  tab={
                    <Tooltip
                      placement="top"
                      title={
                        index === 0 && users.mainLogin
                          ? intl.formatMessage({
                              id: "Main_Account",
                            })
                          : i.accountName
                      }
                      overlayClassName="balance-Tooltip"
                    >
                      <div className="balance-tab">
                        {index === 0 && users.mainLogin
                          ? this.props.intl.formatMessage({
                              id: "Main_Account",
                            })
                          : i.accountName}
                      </div>
                    </Tooltip>
                  }
                  key={i.accountName}
                ></TabPane>
              ))}
            </Tabs>
          </div>
          <div className="balance-dashboardHeaher">
            <div className="balance-dashboardHeaher-user">
              <div className="balance-dashboardHeaher-user-item1">
                <FormattedMessage id="Estimated_Account_Value" />:
                <img
                  src={isEye ? isShow : Show}
                  alt="Open Exchange"
                  onClick={this.updateEye}
                />
              </div>
              <div className="balance-dashboardHeaher-user-item2">
                <p>
                  {!isEye
                    ? toThousands(
                        InquireBalanceData?.tradingType === "USDT"
                          ? InquireBalanceData?.marketValue
                            ? toCoinAccuracy(InquireBalanceData?.marketValue, 4)
                            : 0
                          : InquireBalanceData?.balance
                      )
                    : "********"}
                </p>
                <span>{InquireBalanceData?.tradingType}</span>
                {InquireBalanceData?.tradingType !== "USDT" ? (
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>
                    ≈{" "}
                    <span>
                      {!isEye
                        ? InquireBalanceData?.marketValue
                          ? toThousands(InquireBalanceData?.marketValue)
                          : 0
                        : "********"}
                    </span>
                    <span>{InquireBalanceData?.tradingType}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="balance-table">
            <div className="balance-table-search">
              <div className="balance-table-search-left">
                <Search
                  placeholder={this.props.intl.formatMessage({
                    id: "Search_Coin",
                  })}
                  value={searchValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    this.setState({ searchValue: e.target.value })
                  }
                  onSearch={this.search}
                  enterButton
                />
                <Checkbox checked={hideSmall} onChange={this.setCheckbox}>
                  <FormattedMessage id="Hide Small Balances" />
                </Checkbox>
              </div>

              {users.mainLogin && (
                // <div className="lend-btn">
                <div className="balance-table-search-right">
                  {/* <OPNX.LendPage
                    isOpen={isOpen}
                    onOpenChange={(e) => this.setState({ isOpen: e })}
                    onSuccess={(e)=>{
                        this.initHttpData();
                    }}
                  >
                    <div
                      className="lend-btn"
                      onClick={() => {
                        this.setState({ isOpen: true });
                      }}
                    >
                      Lend your USDT
                    </div>
                  </OPNX.LendPage> */}
                  <span
                    className="balance-title-savings"
                    style={{
                      color: "rgba(255, 255, 255, 0.85)",
                      width: "auto",
                      padding: "0 10px",
                      marginRight: "12px",
                    }}
                    onClick={() =>
                      history.push(
                        "/home/walletManagement/balance/ConvertSmall"
                      )
                    }
                  >
                    Convert small balances to OX
                  </span>
                </div>

                // </div>
              )}
            </div>
            <Table
              columns={columns}
              dataSource={userBlanceData}
              pagination={false}
              rowKey={(recode: any) => recode.coin}
              scroll={{ x: true }}
              locale={{
                emptyText: (
                  <div className="empty-table">
                    <img src={SearchCoin} alt="empty-table" />
                    <span className="balance-empty-table-span">
                      <FormattedMessage id="Search_Coin" />
                    </span>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </Loadding>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  dashboardUserData: state.dashboardUserData,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    async setUser(data: any, type?: string) {
      const res = await dispatch(setUser(data));
      return Promise.resolve(res);
    },
    setDepositCoin(data: string) {
      dispatch(setDepositCoin(data));
    },
    setWithdrawCoin(data: string) {
      dispatch(setWihdrawCoin(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Balance));
