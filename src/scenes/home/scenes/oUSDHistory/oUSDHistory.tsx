import React, { Component } from "react";
import { connect } from "react-redux";
import exportImg from "assets/image/export.svg";
import { IOUSDHistoryStates, IIradeExport } from "./type";
import "./oUSDHistory.scss";
import { Row, Tabs, message } from "antd";
import { getMarkets } from "service/http/http";
import { OUSD, Vault } from "./components";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { switchValue } from "./data";

const { TabPane } = Tabs;

type IOUSDHistoryPropsState = ReturnType<typeof mapStateToProps>;
type IOUSDHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
type IOUSDHistoryProps = IOUSDHistoryPropsState & IOUSDHistoryDispatchState;
class OUSDHistory extends Component<
  IOUSDHistoryProps & WrappedComponentProps,
  IOUSDHistoryStates
> {
  // Reward
  constructor(props: any) {
    super(props);
    const query = new URLSearchParams(window.location.search);
    this.state = {
      visible: false,
      activeKey: query.get("type") === "Vault" ? "Vault" : "oUSD",
      marketsType: [],
      exportList: {
        Mint: {},
        Redeem: {},
        Borrow: {},
        Reward: {},
      },
      initDate: switchValue("1w"),
    };
    // export: {},
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
    return (
      <Row className="OUSDHistory">
        <Row className="t-h-header">oUSD & Vault</Row>
        <Row className="t-h-container">
          <Tabs
            activeKey={this.state.activeKey}
            onChange={(e: string) => {
              this.setState({
                activeKey: e as "oUSD" | "Vault",
              });
            }}
          >
            <TabPane tab="oUSD" key="oUSD">
              {this.state.activeKey === "oUSD" ? <OUSD /> : <></>}
            </TabPane>

            <TabPane tab="Vault" key="Vault">
              {this.state.activeKey === "Vault" ? <Vault /> : <></>}
            </TabPane>
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
)(injectIntl(OUSDHistory));
