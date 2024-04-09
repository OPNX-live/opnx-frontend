import React, { Component } from "react";
import { connect } from "react-redux";
import { ITradeHistoryStates, IIradeExport } from "./type";
import "./flexAssetsBorrow.scss";
import { Row, message } from "antd";
import { RepaymentHistory, BorrowHistory } from "./components";
import { getMarkets } from "service/http/http";
import { messageError, getUrlToken } from "utils";
import { injectIntl, WrappedComponentProps } from "react-intl";
import exportImg from "assets/image/export.svg";
import ExportHistory from "../flexAssetHistory/components/exportHistory/ExportHistory";
import { switchValue } from "../flexAssetHistory/components/exportHistory/data";

type ITradeHistoryPropsState = ReturnType<typeof mapStateToProps>;
type ITradeHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
type ITradeHistoryProps = ITradeHistoryPropsState & ITradeHistoryDispatchState;
class FlexAssetsBorrow extends Component<
  ITradeHistoryProps & WrappedComponentProps,
  ITradeHistoryStates
> {
  constructor(props: any) {
    super(props);
    this.state = {
      visible: false,
      activeKey: "Borrow",
      marketsType: [],
      exportList: {
        Borrow: {},
        Repayment: {}
      },
      initDate: switchValue("1w"),
      initCoin: []
    };
    let tab: any = getUrlToken("tab", props.location.search);
    if (tab !== "Repayment" && tab !== "Borrow") {
      tab = "Borrow";
    }
    setTimeout(() => {
      this.setState({
        activeKey: tab
      });
    }, 100);
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
  onActiveKey = (type: string) => {
    this.setState({
      activeKey: type
    });
  };
  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return;
    };
  };
  render() {
    const { intl } = this.props;
    const { activeKey, exportList, initDate } = this.state;
    return (
      <Row className="flexAssets">
        <div className="t-h-header">
          <div style={{ paddingBottom: "11px" }}>
               Borrow & Repay 
          </div>
          <div className="flex-tabs-nav-wrap">
            <div
              className="flex-tabs-nav-list"
              style={{ transform: "translate(0px, 0px)" }}
            >
              <div
                className={
                  activeKey === "Borrow"
                    ? "flex-tabs-tab flex-tabs-tab-active"
                    : "flex-tabs-tab"
                }
                onClick={() => this.onActiveKey("Borrow")}
              >
                {intl.formatMessage({ id: "Borrow" })}
              </div>
              <div
                className={
                  activeKey === "Repayment"
                    ? "flex-tabs-tab flex-tabs-tab-active"
                    : "flex-tabs-tab"
                }
                onClick={() => this.onActiveKey("Repayment")}
              >
                {intl.formatMessage({ id: "Repay" })}
              </div>
              <div
                className="flex-tabs-ink-bar flex-tabs-ink-bar-animated"
                style={{
                  left: activeKey === "Borrow" ? "0px" : "90px",
                  width: activeKey === "Borrow" ? "57px" : "89px"
                }}
              ></div>
            </div>
            {/* {activeKey === "Repayment" && (
              <div
                onClick={() => {
                  this.setState({
                    visible: true
                  });
                }}
                className="export-title"
              >
                {this.props.intl.formatMessage(
                  { id: "Export_History" },
                  {
                    type: this.props.intl.formatMessage({
                      id: this.state.activeKey
                    })
                  }
                )}
                <img src={exportImg} alt="export" />
              </div>
            )} */}
          </div>
        </div>
        {activeKey === "Borrow" ? <BorrowHistory /> : null}
        {activeKey === "Repayment" ? (
          <RepaymentHistory
            initCoin={(e) => {
              this.setState({
                exportList: {
                  [activeKey]: {
                    coin: e
                  }
                }
              });
            }}
          />
        ) : null}
        {activeKey === "Repayment" && (
          <ExportHistory
            type={this.state.activeKey}
            coin={[(exportList[activeKey] as IIradeExport).coin]}
            initDate={initDate}
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
)(injectIntl(FlexAssetsBorrow));
