import React, { Component } from "react";
import { connect } from "react-redux";
import exportImg from "assets/image/export.svg";
import { IFlexAssetHistoryStates, IIradeExport } from "./type";
import "./FlexAssetHistory.scss";
import { Row, Tabs, message } from "antd";
import { getMarkets } from "service/http/http";
import { LendHistory, RedeemHistory } from "./components";
import ExportHistory from "./components/exportHistory/ExportHistory";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { switchValue } from "./components/exportHistory/data";

const { TabPane } = Tabs;

type IFlexAssetHistoryPropsState = ReturnType<typeof mapStateToProps>;
type IFlexAssetHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
type IFlexAssetHistoryProps = IFlexAssetHistoryPropsState &
  IFlexAssetHistoryDispatchState;
class FlexAssetHistory extends Component<
  IFlexAssetHistoryProps & WrappedComponentProps,
  IFlexAssetHistoryStates
> {
  // Reward
  constructor(props: any) {
    super(props);
    const query = new URLSearchParams(window.location.search);
    console.log(query.get("type"))
    this.state = {
      visible: false,
      activeKey:query.get("type")==="redeem"? "Redeem":"Lend",
      marketsType: [],
      exportList: {
        Mint: {},
        Redeem: {},
        Borrow: {},
        Reward: {}
      },
      initDate: switchValue("1w")
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
    const { exportList, initDate } = this.state;
    const { intl } = this.props;
    return (
      <Row className="flexAssetHistory">
        <Row className="t-h-header">
         Lend & Redeem
        </Row>
        <Row className="t-h-container">
          <Tabs
            activeKey={this.state.activeKey}
            onChange={(e: string) => {
              this.setState({
                activeKey: e as "Lend" | "Redeem"
              });
            }}
            // tabBarExtraContent={
            //   <div
            //     onClick={() => {
            //       this.setState({
            //         visible: true
            //       });
            //     }}
            //     className="export-title"
            //   >
            //     {this.props.intl.formatMessage(
            //       { id: "Export_History" },
            //       {
            //         type: this.props.intl.formatMessage({
            //           id: this.state.activeKey
            //         })
            //       }
            //     )}
            //     <img src={exportImg} alt="export" />
            //   </div>
            // }
          >
            <TabPane
              tab={this.props.intl.formatMessage({ id: "Lend" })}
              key="Lend"
            >
              {this.state.activeKey === "Lend" ? <LendHistory /> : <></>}
            </TabPane>

            <TabPane
              tab={this.props.intl.formatMessage({ id: "Redeem" })}
              key="Redeem"
            >
              {this.state.activeKey === "Redeem" ? <RedeemHistory /> : <></>}
            </TabPane>
          </Tabs>
        </Row>
        {/* {
          <ExportHistory
            type={this.state.activeKey}
            coin={(exportList[this.state.activeKey] as IIradeExport).coin}
            initDate={initDate}
            visible={this.state.visible}
            handlerModale={(visible: boolean) => {
              this.setState({ visible });
            }}
            status={
              (exportList[this.state.activeKey] as IIradeExport).status || []
            }
          />
        } */}
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
)(injectIntl(FlexAssetHistory));
