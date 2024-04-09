import React, { Component } from "react";
import { connect } from "react-redux";
import { ITradeHistoryStates, ITradeSubTab, IIradeExport } from "./type";
import "./TradeHistory.scss";
import { Row, Tabs, message } from "antd";
import exportImg from "assets/image/export.svg";
import {
  Spread,
  Repo,
  SpotHistory,
  FuturesHistory,
  IndexHistory
} from "./components";
import { getMarkets } from "service/http/http";
import { messageError } from "utils";
import ExportHistory from "../history/component/exportHistory/ExportHistory";
import { ISpreadSearchParams } from "./components/spread/type";
import { IRepoSearchParams } from "./components/repo/type";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps
} from "react-intl";

const { TabPane } = Tabs;

type ITradeHistoryPropsState = ReturnType<typeof mapStateToProps>;
type ITradeHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
type ITradeHistoryProps = ITradeHistoryPropsState & ITradeHistoryDispatchState;
class TradeHistory extends Component<
  ITradeHistoryProps & WrappedComponentProps,
  ITradeHistoryStates
> {
  readonly state: ITradeHistoryStates = {
    visible: false,
    activeKey: "Spot",
    marketsType: [],
    exportList: {
      Spot: {},
      Spread: {},
      Futures: {},
      Repo: {},
      Index: {}
    }
    // export: {},
  };
  subTab(fn: Function) {
    return fn([
      {
        key: this.props.intl.formatMessage({ id: "Spot" }),
        name: "Spot",
        component: (
          <SpotHistory
            exportsBack={(e: ISpreadSearchParams) => {
              this.setState({
                exportList: {
                  ...this.state.exportList,
                  Spot: {
                    coin: e.contract,
                    initDate: [e.startDate, e.endDate]
                  }
                }
              });
            }}
            markets={this.state.marketsType}
          />
        )
      },
      {
        key: this.props.intl.formatMessage({ id: "Futures" }),
        name: "Futures",
        component: (
          <FuturesHistory
            exportsBack={(e: ISpreadSearchParams & { type: string[] }) => {
              this.setState({
                exportList: {
                  ...this.state.exportList,
                  Futures: {
                    coin: e.contract,
                    initDate: [e.startDate, e.endDate],
                    status: e.type
                  }
                }
              });
            }}
            markets={this.state.marketsType}
          />
        )
      },
      // {
      //   key: this.props.intl.formatMessage({ id: "Spread" }),
      //   name: "Spread",
      //   component: (
      //     <Spread
      //       markets={this.state.marketsType}
      //       exportsBack={(e: ISpreadSearchParams) => {
      //         this.setState({
      //           exportList: {
      //             ...this.state.exportList,
      //             Spread: {
      //               coin: e.contract,
      //               initDate: [e.startDate, e.endDate]
      //             }
      //           }
      //         });
      //       }}
      //     />
      //   )
      // },
      {
        key: this.props.intl.formatMessage({ id: "Repo" }),
        name: "Repo",
        component: (
          <Repo
            markets={this.state.marketsType}
            exportsBack={(e: IRepoSearchParams) => {
              this.setState({
                exportList: {
                  ...this.state.exportList,
                  Repo: {
                    coin: e.contract,
                    initDate: [e.startDate, e.endDate]
                  }
                }
              });
            }}
          />
        )
      },
      // {
      //   key: this.props.intl.formatMessage({ id: "Index" }),
      //   name: "Index",
      //   component: (
      //     <IndexHistory
      //       markets={this.state.marketsType}
      //       exportsBack={(e: IRepoSearchParams) => {
      //         this.setState({
      //           exportList: {
      //             ...this.state.exportList,
      //             Index: {
      //               coin: e.contract,
      //               initDate: [e.startDate, e.endDate]
      //             }
      //           }
      //         });
      //       }}
      //     />
      //   )
      // }
    ]);
  }
  async componentDidMount() {
    const result = await getMarkets();
    if (result.success) {
      const arr = Object.keys(result.data).filter(
        (p) => p.split("-").length === 2
      );
      this.setState({ marketsType: arr });
    }
    !result.success && message.warn(result.message);
  }
  render() {
    const { exportList, activeKey } = this.state;
    const { intl } = this.props;
    return (
      <Row className="tradeHistory">
        <Row className="t-h-header">
          {intl.formatMessage({ id: "Trade_History" })}
        </Row>
        <Row className="t-h-container">
          <Tabs
            activeKey={this.state.activeKey}
            onChange={(e: string) => {
              this.setState({
                activeKey: e as "Spot" | "Futures" | "Spread" | "Repo" | "Index"
              });
            }}
            tabBarExtraContent={
              activeKey !== "Index" ? (
                <Row
                  onClick={() => {
                    this.setState({ visible: true });
                  }}
                >
                  <FormattedMessage
                    id="Export_History"
                    values={{
                      type: <FormattedMessage id={this.state.activeKey} />
                    }}
                  />
                  <img src={exportImg} alt="export" />
                </Row>
              ) : null
            }
          >
            {this.subTab((p: ITradeSubTab[]) => {
              return p.map((r: ITradeSubTab) => (
                <TabPane tab={r.key} key={r.name}>
                  {r.component}
                </TabPane>
              ));
            })}
          </Tabs>
        </Row>
        {this.state.visible && (
          <ExportHistory
            type={this.state.activeKey}
            coin={
              (exportList[this.state.activeKey] as IIradeExport)?.coin || []
            }
            initDate={
              (exportList[this.state.activeKey] as IIradeExport).initDate
            }
            visible={this.state.visible}
            handlerModale={(visible: boolean) => {
              this.setState({ visible });
            }}
            status={
              (exportList[this.state.activeKey] as IIradeExport).status || []
            }
          />
        )}
      </Row>
    );
  }
}
const mapStateToProps = (state: null) => {
  return {};
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TradeHistory));
