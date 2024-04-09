import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  ISpreadStates,
  prev,
  next,
  Date,
  ISpreadPropsInput,
  IBorrowTableData
} from "./type";
import "./repayment.scss";
import { Button, Table, message, Select, DatePicker } from "antd";
import moment from "moment";
import { PrevDay, comparedDate, messageError, toUtc, guid } from "utils";
import { Loadding } from "components/loadding";
import { injectIntl, WrappedComponentProps } from "react-intl";
import empty from "assets/image/empty-table.png";
import { borrowHistory, getBorrowHisory, getBorrowRepayType } from "service/http/http";
const { Option } = Select;
const { RangePicker } = DatePicker;
interface IProps {
  initCoin: (e: string[]) => void;
}

type ISpreadPropsState = ReturnType<typeof mapStateToProps>;
type ISpreadDispatchState = ReturnType<typeof mapDispatchToProps> & IProps;

type ISpreadProps = ISpreadPropsState &
  ISpreadDispatchState &
  ISpreadPropsInput;
class RepaymentHistory extends PureComponent<
  ISpreadProps & WrappedComponentProps,
  ISpreadStates
> {
  readonly state: ISpreadStates = {
    loading: 0,
    markets: [],
    result: {
      data: [],
      total: 0
    },
    historyData: [],
    accounts: [],
    activeKey: "",
    historyTotal: 0,
    params: {
      pageNum: 1,
      pageSize: 10,
      searchParams: {
        contract: [],
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1]
      }
    },
    historytime: [],
    historyNum: 0,
    historySize: 10,
    borrows: [],
    typeSelect: undefined,
    tabLoading: false
  };

  columns = [
    {
      title: "Collateral",
      key: "collateral",
      dataIndex: "collateral",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
     
    },
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: string) => moment(item).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      title:"Status",
      key: "executionStatus",
      dataIndex: "executionStatus",
      render: (item: string) =>this.formatInitial(item)
       
    }
  ];
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }
  formatInitial(value: string) {
    if (value) {
      const LowerCase = value.toLocaleLowerCase();
      return LowerCase.slice(0, 1).toLocaleUpperCase() + LowerCase.slice(1);
    }
    return "--";
  }
  componentDidMount() {
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
    this.setState(
      {
        historytime: time
      },
      () => {
        this.futuresHistoryData();
      }
    );
  }
  futuresHistoryData = async () => {
    this.setState({
      tabLoading: true,
      loading: 0
    });
    const { historyNum, historySize, historytime } = this.state;
    const params: IBorrowTableData = {
      pageNum: historyNum,
      pageSize: historySize,
      searchParams: {
        type: "REPAY",
        collateral: "",
        startDate: toUtc(historytime[0]),
        endDate: moment(toUtc(historytime[1]))
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss")
      }
    };

    const result = await borrowHistory(params);
    result.success &&
      this.setState({
        historyData: result.data.data,
        historyTotal: result.data.total
      });
    !result.success && message.warning(result.message);
    this.setState({
      tabLoading: false
    });
  };
  onChagenTabs = (e: any) => {
    this.setState(
      {
        activeKey: e
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  handleChange = (e: any) => {
    this.props.initCoin(e);
    this.setState({ typeSelect: e });
  };
  onShowSizeChange = (type: number, page: number, pageSize: number) => {
    this.setState(
      {
        historyNum: page,
        historySize: pageSize!
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  onPaginationChange = (
    type: number,
    page: number,
    pageSize?: number | undefined
  ) => {
    this.setState(
      {
        historyNum: page,
        historySize: pageSize!
      },
      () => {
        this.futuresHistoryData();
      }
    );
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
  futuresReset = (type: string) => {
    const time = [
      moment
        .parseZone(PrevDay(1, "weeks")[0], "YYYY-MM-DD HH:mm:ss")
        .local()
        .format("YYYY-MM-DD HH:mm:ss"),
      moment
        .parseZone(PrevDay(1, "weeks")[1], "YYYY-MM-DD HH:mm:ss")
        .local()
        .format("YYYY-MM-DD HH:mm:ss")
    ];
    this.setState(
      {
        typeSelect: undefined,
        historytime: time
      },
      () => {
        this.futuresHistoryData();
      }
    );
  };
  onPickerChange = (type: string, date: any, dateString: string[]) => {
    if (comparedDate(dateString)) {
      this.setState({
        historytime: dateString
      });
    } else {
      message.error(messageError("31002"));
    }
  };
  toFlexAsset = () => {
    sessionStorage.setItem("tabIndex", "4");
    window.location.href = process.env.REACT_APP_EARN ?? "";
  };
  render() {
    const { intl } = this.props;
    const {
      historyData,
      historyTotal,
      historytime,
      tabLoading,
    } = this.state;
    return (
      <Loadding show={this.state.loading}>
        <div className="repayment">
          <>
            <div className="funding-box">
              <div>
                {" "}
                <div className="markets-top">
                  {intl.formatMessage({ id: "Date" })}
                </div>
                <RangePicker
                  format={"YYYY-MM-DD"}
                  value={
                    historytime && [
                      moment(historytime[0], "YYYY-MM-DD"),
                      moment(historytime[1], "YYYY-MM-DD")
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
              {/* <div className="coin-borrowed">
                <div className="borrowed-top">
                  {intl.formatMessage({ id: "CoinRepaid" })}
                </div>
                <Select
                  className="spot-select"
                  style={{ width: 200 }}
                  getPopupContainer={(triggerNode) => triggerNode}
                  onChange={this.handleChange}
                  showArrow={true}
                  value={typeSelect}
                  placeholder={intl.formatMessage({
                    id: "ALL"
                  })}
                >
                  {borrows?.map((i: any, index: number) => {
                    return (
                      <Option key={index} value={i}>
                        {i}
                      </Option>
                    );
                  })}
                </Select>
              </div> */}
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
            <Table
              loading={tabLoading}
              className="ant_table"
              columns={this.columns}
              dataSource={historyData}
              rowKey={(recond) => guid()}
              scroll={{ x: true }}
              locale={{
                emptyText: (
                  <div className="empty-table">
                    <img src={empty} alt="empty-table" />
                    <span style={{ marginTop: "12px" }}>
                      {intl.formatMessage({ id: "No_Data" })}
                    </span>
                  </div>
                )
              }}
              pagination={{
                hideOnSinglePage: true,
                pageSizeOptions: ["10", "20", "30"],
                defaultPageSize: 10,
                showQuickJumper: true,
                onShowSizeChange: this.onShowSizeChange.bind(this, 1),
                showSizeChanger: true,
                size: "small",
                total: historyTotal,
                onChange: this.onPaginationChange.bind(this, 1),
                itemRender: this.itemRender
              }}
            />
          </>
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: { users: Iusers }) => {
  return {
    users: state.users
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RepaymentHistory));
