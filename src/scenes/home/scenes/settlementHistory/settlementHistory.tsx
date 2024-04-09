import React, { Component } from "react";
import { connect } from "react-redux";
import { ITradeHistoryStates, ITradeSubTab } from "./type";
import "./settlementHistory.scss";
import { Row, Tabs, message } from "antd";
import { Futures, IndexHistory } from "./components";
import { getMarkets } from "service/http/http";
import { messageError } from "utils";
import { injectIntl, WrappedComponentProps } from "react-intl";

const { TabPane } = Tabs;

type ITradeHistoryPropsState = ReturnType<typeof mapStateToProps>;
type ITradeHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
type ITradeHistoryProps = ITradeHistoryPropsState & ITradeHistoryDispatchState;
class SettlementHistory extends Component<
  ITradeHistoryProps & WrappedComponentProps,
  ITradeHistoryStates
> {
  readonly state: ITradeHistoryStates = {
    visible: false,
    activeKey: "Perp",
    marketsType: [],
    exportList: {
      Spot: {},
      Spread: {},
      Futures: {},
      Repo: {}
    }
    // export: {},
  };
  subTab(fn: Function) {
    return fn([
      {
        key: this.props.intl.formatMessage({ id: "Perp" }),
        name: "Perp",
        component: <IndexHistory />
      },
      {
        key: this.props.intl.formatMessage({ id: "Futures" }),
        name: "Futures",
        component: <Futures />
      }
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
    const { intl } = this.props;
    return (
      <Row className="tradeHistory">
        <Row className="t-h-header">
          {intl.formatMessage({ id: "SettlementHistory" })}
        </Row>
        <Row className="t-h-container">
          <Tabs
            activeKey={this.state.activeKey}
            onChange={(e: string) => {
              this.setState({
                activeKey: e as "Futures" | "Index"
              });
            }}
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
)(injectIntl(SettlementHistory));
