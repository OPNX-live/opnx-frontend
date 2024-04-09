import React, { Component } from "react";
import { connect } from "react-redux";
import { Tabs, message } from "antd";
import exportImg from "assets/image/export.svg";
import BorrowLiquidationTable from "./component/BorrowLiquidationTable/borrowLiquidation";
import TradeTable from "./component/tradeTable/tradeTable";
import TransferTable from "./component/transferTable/transferTable";
import ExportHistory from "./component/exportHistory/ExportHistory";
import OpenOrdersTable from "./component/openOrdersTable/openOrdersTable";
import InterestPaymentTable from "./component/interestPaymentTable/interestPaymentTable";
import "./AmmHistory.scss";
import history from "router/history";
import { messageError } from "utils";
import { setDashboardUserData } from "store/actions/publicAction";
import { allAmm } from "service/http/http";
import { switchValue } from "./component/exportHistory/data";
import { WrappedComponentProps, injectIntl } from "react-intl";

const { TabPane } = Tabs;
interface IState {
  isVisible: boolean;
  initDate: any;
  initSearchValue: string;
  type: string;
  ammOptions: Array<string>;
  urlVal: string;
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
      type: "Trade",
      initSearchValue: "",
      ammOptions: [],
      urlVal: ""
    };
  }
  getAmmOptions = async () => {
    try {
      await allAmm().then((res) => {
        if (res.code === "0000") {
          this.setState({
            ammOptions: res.data,
            initSearchValue:
              history.location.search.substring(1).split("amm=")[1] ??
              res.data[0]
          });
        } else {
          message.warning(res.message);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  async componentDidMount() {
    const state = history.location.state as { type: string };
    this.setState({
      type: state ? state?.type : this.state.type,
      urlVal: history.location.search.substring(1).split("amm=")[1] ?? ""
    });
    try {
      await this.getAmmOptions();
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    return (
      <div className="wallet-withdraw">
        <div className="wallet-withdraw-title">
        AMM History
        </div>
        <Tabs
          defaultActiveKey={this.state.type}
          activeKey={this.state.type}
          onChange={(key) => {
            this.setState({
              type: key
            });
          }}
          destroyInactiveTabPane
          // activeKey={this.props.activeKey ? this.props.activeKey : '1'}
          tabBarExtraContent={
            this.state.ammOptions?.length > 0 ? (
              <div
                onClick={() => {
                  this.setState({
                    isVisible: true
                  });
                }}
                className="export-title"
              >
                {this.props.intl.formatMessage(
                  { id: "Export_History" },
                  {
                    type: this.props.intl.formatMessage({ id: this.state.type })
                  }
                )}
                <img src={exportImg} alt="export" />
              </div>
            ) : null
          }
        >
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "Trade",
              defaultMessage: "Trade History"
            })}
            key="Trade"
          >
            <TradeTable
              urlVal={this.state.urlVal}
              ammOptions={this.state.ammOptions}
              searchValue={this.state.initSearchValue}
              initSearchValue={(e) => {
                this.setState({
                  initSearchValue: e
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={"Liquidation History"}
            key="Borrow/Liquidation"
          >
            <BorrowLiquidationTable
              ammOptions={this.state.ammOptions}
              searchValue={this.state.initSearchValue}
              initSearchValue={(e) => {
                this.setState({
                  initSearchValue: e
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "InterestPayment",
              defaultMessage: "Interest Payment History"
            })}
            key="Interest Payment"
          >
            <InterestPaymentTable
              ammOptions={this.state.ammOptions}
              searchValue={this.state.initSearchValue}
              initSearchValue={(e) => {
                this.setState({
                  initSearchValue: e
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "OpenOrders",
              defaultMessage: "Open Orders"
            })}
            key="Open Orders"
          >
            <OpenOrdersTable
              ammOptions={this.state.ammOptions}
              searchValue={this.state.initSearchValue}
              initSearchValue={(e) => {
                this.setState({
                  initSearchValue: e
                });
              }}
            />
          </TabPane>
          <TabPane
            tab={this.props.intl.formatMessage({
              id: "TransferHistory",
              defaultMessage: "Transfer History"
            })}
            key="Transfer"
          >
            <TransferTable
              ammOptions={this.state.ammOptions}
              searchValue={this.state.initSearchValue}
              initSearchValue={(e) => {
                this.setState({
                  initSearchValue: e
                });
              }}
            />
          </TabPane>
        </Tabs>
        {this.state.isVisible ? (
          <ExportHistory
            type={this.state.type as any}
            hashToken={this.state.initSearchValue}
            visible={this.state.isVisible}
            handlerModale={() => {
              this.setState({
                isVisible: false
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
)(injectIntl(Withdraw));
