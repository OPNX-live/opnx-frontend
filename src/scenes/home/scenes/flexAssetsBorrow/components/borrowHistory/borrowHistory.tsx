import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, DatePicker, Table, Button, message } from "antd";
import { PrevDay, comparedDate, toUtc } from "utils/utils";
import {
  prev,
  next,
  Date,
  IBorrowState,
  IBorrowProps,
  IBorrowTableData,
  IFundingPaymeny,
} from "./type";
import moment from "moment";
import { messageError, guid } from "utils";
import { borrowHistory } from "service/http/http";
import { Loadding } from "components/loadding";
import empty from "assets/image/empty-table.png";
import "./borrowHistory.scss";
import { injectIntl, WrappedComponentProps } from "react-intl";
const { RangePicker } = DatePicker;
const { Option } = Select;
type IFuturesHistoryPropsState = ReturnType<typeof mapStateToProps>;
type IFuturesHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;

const rateType: any = {
  FIXED_RATE: "Fixed",
  FLOATING_RATE: "Floating",
};
class BorrowHistory extends Component<
  IBorrowProps & WrappedComponentProps & IFuturesHistoryPropsState,
  IBorrowState
> {
  columns = [
    {
      title: "Collateral",
      dataIndex: "collateral",
      key: "collateral",
    },
   
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "Type",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: string, index: IFundingPaymeny) =>
        moment(item).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Status",
      dataIndex: "executionStatus",
      key: "executionStatus",
      render: (item: string) => this.formatInitial(item),
    },
  ];
  constructor(props: any) {
    super(props);
    this.state = {
      historyData: [],
      historytime: [],
      historyNum: 1,
      historySize: 10,
      historyTotal: 0,
      typeSelect: undefined,
      loading: 0,
      accounts: [],
      activeKey: "",
      activeAccountKey: "",
      borrows: [],
      tradeAndFailed: "Failed",
      visible: false,
      borrowLoading: false,
      historyLoading: false,
      activeRow: {},
    };
  }
  formatInitial(value: string) {
    if (value) {
      const LowerCase = value.toLocaleLowerCase();
      return LowerCase.slice(0, 1).toLocaleUpperCase() + LowerCase.slice(1);
    }
    return "--";
  }
  async componentDidMount() {
    const time = [
      moment
        .parseZone(PrevDay(1, "weeks")[0], "YYYY-MM-DD 00:00:00")
        .local()
        .utc()
        .format("YYYY-MM-DD HH:mm:ss"),
      moment
        .parseZone(PrevDay(1, "weeks")[1], "YYYY-MM-DD 00:00:00")
        .local()
        .utc()
        .format("YYYY-MM-DD HH:mm:ss")
    ];
    console.log(time)
    this.setState({
      historytime: time,
    },()=>{
      this.futuresHistoryData();
    });
    this.setState({ loading: 0 });
   
  }
  onActive = (type: "Trade" | "Failed", row: any) => {
    this.setState({
      tradeAndFailed: type,
      visible: true,
      activeRow: row,
    });
  };
  onTrade = () => {
    window.open(process.env.REACT_APP_MARKETS_URL);
  };

  futuresHistoryData = async () => {
    this.setState({ historyLoading: true });
    const { historyNum, historySize,historytime } = this.state;
    const params: IBorrowTableData = {
      pageNum: historyNum,
      pageSize: historySize,
      searchParams: {
        type: "BORROW",
        collateral: "",
        startDate: toUtc(historytime[0]),
        endDate: moment(toUtc(historytime[1]))
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss")
      },
    };
    const result = await borrowHistory(params);
    result.success &&
      this.setState({
        historyData: result.data.data,
        historyTotal: result.data.total,
      });
    !result.success && message.warning(result.message);
    this.setState({ historyLoading: false, loading: 0 });
  };
  itemRender = (
    current: number,
    type: string,
    originalElement: React.ReactNode
  ) => {
    if (type === "prev") {
      return <img alt="prev" src={prev} />;
    }
    if (type === "next") {
      return <img alt="next" src={next} />;
    }
    return originalElement;
  };
  handleChange = (e: string) => {
    this.setState({ typeSelect: e });
  };
  onPickerChange = (type: string, date: any, dateString: string[]) => {
    if (comparedDate(dateString)) {
      this.setState({
        historytime: dateString,
      });
    } else {
      message.error(messageError("31002"));
    }
  };
  onPaginationChange = (
    type: number,
    page: number,
    pageSize?: number | undefined
  ) => {
    this.setState(
      {
        historyNum: page,
        historySize: pageSize!,
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  onShowSizeChange = (type: number, page: number, pageSize: number) => {
    this.setState(
      {
        historyNum: page,
        historySize: pageSize!,
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  onChagenTabs = (e: any) => {
    this.setState(
      {
        activeKey: e,
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  futuresReset = (type: string) => {
    const time = [
      moment
        .parseZone(PrevDay(1, "weeks")[0], "YYYY-MM-DD HH:mm:ss")
        .local()
        .format("YYYY-MM-DD HH:mm:ss"),
      moment
        .parseZone(PrevDay(1, "weeks")[1], "YYYY-MM-DD HH:mm:ss")
        .local()
        .format("YYYY-MM-DD HH:mm:ss"),
    ];
    this.setState(
      {
        historyNum: 1,
        historySize: 10,
        historytime: time,
        typeSelect: undefined,
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  toFlexAsset = (tabIndex: string) => {
    sessionStorage.setItem("tabIndex", tabIndex);
    window.location.href = process.env.REACT_APP_EARN ?? "";
  };
  render() {
    const { intl } = this.props;
    const { loading, borrowLoading, historytime, historyData } = this.state;
    return (
      <Loadding show={loading}>
        <div className="borrow-history">
          <>
            <div className="funding-box">
              {/* <div className="coin-borrowed">
                <div className="borrowed-top">
                  pool 
                </div>
                <Select
                  className="spot-select"
                  style={{ width: 200 }}
                  getPopupContainer={(triggerNode) => triggerNode}
                  onChange={this.handleChange}
                  showArrow={true}
                >
                  <Option value={"sss"}>ssss</Option>
                </Select>
              </div> */}
              <div style={{ marginLeft: "4px" }}>
                {" "}
                <div className="markets-top">
                  {intl.formatMessage({ id: "Date" })}
                </div>
                <RangePicker
                  format={"YYYY-MM-DD"}
                  value={
                    historytime && [
                      moment(historytime[0], "YYYY-MM-DD"),
                      moment(historytime[1], "YYYY-MM-DD"),
                    ]
                  }
                  separator=" ~ "
                  allowClear={false}
                  suffixIcon={<Date />}
                  disabledDate={(current: any) =>
                    current && current > moment().endOf("day")
                  }
                  className="date-picker"
                  onChange={this.onPickerChange.bind(this, "funding")}
                />
              </div>

              <div className="spot-search">
                <Button type="text" onClick={this.futuresHistoryData}>
                  {intl.formatMessage({ id: "Search" })}
                </Button>
              </div>
              <div className="spot-btn">
                <Button
                  type="text"
                  onClick={this.futuresReset.bind(this, "funding")}
                >
                  {intl.formatMessage({ id: "Reset" })}
                </Button>
              </div>
            </div>
            <div className="borrow-top">
              <div className="borrow-history-top">
                <Table
                  loading={borrowLoading}
                  className="ant_table"
                  columns={this.columns}
                  dataSource={historyData}
                  rowKey={(recond) => guid()}
                  scroll={{ x: true }}
                  pagination={{
                    total: this.state.historyTotal,
                    defaultPageSize: 10,
                    showQuickJumper: true,
                    showSizeChanger: true,
                    hideOnSinglePage: true,
                    size: "small",
                    current: this.state.historyNum,
                    pageSize: this.state.historySize,
                    onChange: (pageNum, pageSize) => {
                      this.setState(
                        {
                          historyNum: pageNum,
                          historySize: pageSize,
                        },
                        () => {
                          this.futuresHistoryData();
                        }
                      );
                    },
                    itemRender: this.itemRender,
                  }}
                  locale={{
                    emptyText: (
                      <div className="empty-table">
                        <img src={empty} alt="empty-table" />
                        <span style={{ marginTop: "12px" }}>
                          {intl.formatMessage({ id: "No_Data" })}
                        </span>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
          </>
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: { users: Iusers }) => {
  return {
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BorrowHistory));
