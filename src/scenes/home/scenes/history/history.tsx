import React, { Component } from "react";
import { connect } from "react-redux";
import { Tabs, message } from "antd";
import exportImg from "assets/image/export.svg";
import WithdrawTable from "./component/WithdrawTable/withdrawtable";
import DepositTable from "./component/depositTable/depositTable";
import TransferTable from "./component/transferTable/transferTable";
import ExportHistory from "./component/exportHistory/ExportHistory";
import DeliveryTable from "./component/deliveryTable/deliveryTable";
import TransactioTable from "./component/transactioTable/transactioTable";
import BuyCryptoHistory from "./component/BuyCryptoHistory/BuyCryptoHistory";
import "./history.scss";
import history from "router/history";
import { messageError } from "utils";
import { setDashboardUserData } from "store/actions/publicAction";
import { UserData } from "service/http/http";
import { switchValue } from "./component/exportHistory/data";
import { WrappedComponentProps, injectIntl } from "react-intl";
import FLEXConvertTable from "./component/FLEXConvertTable/FLEXConvertTable";

const { TabPane } = Tabs;
interface IState {
  isVisible: boolean;
  initDate: any;
  initCoin: string[];
  initStatus: string[];
  type: string;
}

interface IProps {
  activeKey: string;
}

type IWithdrawPropsState = ReturnType<typeof mapStateToProps>;
type IWithdrawDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawPropsState &
  WrappedComponentProps;
class Withdraw extends Component<IWithdrawDispatchState, IState> {
  constructor(props: IWithdrawDispatchState) {
    super(props);
    this.state = {
      isVisible: false,
      initDate: switchValue("1w"),
      type: "Deposit",
      initCoin: [],
      initStatus: [],
    };
  }
  componentDidMount() {
    const state = history.location.state as { type: string };
    this.setState({
      type: state ? state?.type : this.state.type,
    });
    UserData().then((res) => {
      if (res.code === "0000") {
        this.props.setDashboardUserData(res.data);
        if (!res.data.isMainAccount && this.state.type === "Withdrawal") {
          message.warning(
            this.props.intl.formatMessage({
              id: "TheSubAccountHas",
              defaultMessage:
                "The sub-account has no history of withdrawal. Currently only the main account can withdraw.",
            })
          );
        }
      } else {
        message.error(res.message);
      }
    });
  }
  render() {
    const { type } = this.state;
    return (
      <div className="wallet-withdraw">
        <div className="wallet-withdraw-title">
          {this.props.intl.formatMessage({
            id: "History",
            defaultMessage: "History",
          })}
        </div>
        <Tabs
          defaultActiveKey={this.state.type}
          activeKey={this.state.type}
          onChange={(key) => {
            this.setState({
              type: key,
            });
            if (
              !this.props.dashboardUserData.isMainAccount &&
              key === "Withdrawal"
            ) {
              message.warning(
                this.props.intl.formatMessage({
                  id: "TheSubAccountHas",
                  defaultMessage:
                    "The sub-account has no history of withdrawal. Currently only the main account can withdraw.",
                })
              );
            }
          }}
          // activeKey={this.props.activeKey ? this.props.activeKey : '1'}
          tabBarExtraContent={
            <div
              onClick={() => {
                this.setState({
                  isVisible: true,
                });
              }}
              className="export-title"
            >
              {`Export ${
                this.state.type === "FLEX Convert"
                  ? "OX Convert"
                  : this.state.type
              } History`}
              <img src={exportImg} alt="export" />
            </div>
          }
        >
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "Deposit",
              defaultMessage: "Deposit",
            })}
            key="Deposit"
          >
            <DepositTable
              initCoin={(e) => {
                this.setState({
                  initCoin: e,
                });
              }}
              initStatus={(e) => {
                this.setState({
                  initStatus: e,
                });
              }}
              initDate={(e) => {
                this.setState({
                  initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`],
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "Withdraw",
              defaultMessage: "Withdraw",
            })}
            key="Withdrawal"
          >
            <WithdrawTable
              initCoin={(e) => {
                this.setState({
                  initCoin: e,
                });
              }}
              initStatus={(e) => {
                this.setState({
                  initStatus: e,
                });
              }}
              initDate={(e) => {
                this.setState({
                  initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`],
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "Transfer",
              defaultMessage: "Transfer",
            })}
            key="Transfer"
          >
            <TransferTable
              initDate={(e) => {
                this.setState({
                  initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`],
                });
              }}
              initStatus={(e) => {
                this.setState({
                  initStatus: e,
                });
              }}
              initCoin={(e) => {
                this.setState({
                  initCoin: e,
                });
              }}
            />
          </TabPane>
          {/* <TabPane
            tab={this.props.intl.formatMessage({
              id: "Delivery",
              defaultMessage: "Delivery"
            })}
            key="Delivery"
          >
            <DeliveryTable
              initDate={(e) => {
                this.setState({
                  initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`]
                });
              }}
              initStatus={(e) => {
                this.setState({
                  initStatus: e
                });
              }}
              initCoin={(e) => {
                this.setState({
                  initCoin: e
                });
              }}
            />
          </TabPane> */}
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "Consolidated",
              defaultMessage: "Consolidated",
            })}
            key="Consolidated"
          >
            <TransactioTable
              initDate={(e) => {
                this.setState({
                  initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`],
                });
              }}
              initStatus={(e) => {
                this.setState({
                  initStatus: e,
                });
              }}
              initCoin={(e) => {
                this.setState({
                  initCoin: e,
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "OX Convert",
              defaultMessage: "OX Convert",
            })}
            key="FLEX Convert"
          >
            <FLEXConvertTable />
          </TabPane>
          {/* <TabPane
            tab={this.props.intl.formatMessage({
              id: "Buy Crypto History",
              defaultMessage: "Buy Crypto History"
            })}
            key="BuyCrypto"
          >
            <BuyCryptoHistory
              initDate={(e) => {
                this.setState({
                  initDate: [`${e[0]} 00:00:00`, `${e[1]} 00:00:00`]
                });
              }}
              initStatus={(e) => {
                this.setState({
                  initStatus: e
                });
              }}
              initCoin={(e) => {
                this.setState({
                  initCoin: e
                });
              }}
            />
          </TabPane> */}
        </Tabs>
        {this.state.isVisible ? (
          <ExportHistory
            type={this.state.type as any}
            coin={this.state.initCoin}
            status={this.state.initStatus}
            visible={this.state.isVisible}
            handlerModale={() => {
              this.setState({
                isVisible: false,
              });
            }}
            initDate={this.state.initDate}
          />
        ) : null}
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
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Withdraw));
