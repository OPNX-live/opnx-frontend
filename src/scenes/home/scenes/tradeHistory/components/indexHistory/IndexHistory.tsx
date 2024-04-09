import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, DatePicker, Table, Button, message } from "antd";
import { PrevDay, comparedDate, toUtc } from "utils/utils";
import {
  prev,
  next,
  Date,
  FuturesHistoryState,
  IndexState,
  IIndexProps,
  ISpotTableData,
  ISpotData,
  checkNumber,
  IFundingPaymeny
} from "./type";
import moment from "moment";
import _ from "lodash";
import { messageError } from "utils";
import {
  futuresHistory,
  fundingHistory,
  futuresTypes,
  getMarketAll
} from "service/http/http";
import { Loadding } from "components/loadding";
import empty from "assets/image/empty-table.png";
import "./IndexHistory.scss";
import { EnumSideColor } from "schemas/index.enum";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { typeSource } from "../../data";
const { RangePicker } = DatePicker;

const { Option } = Select;
const sideType: { [key: string]: string } = EnumSideColor;
type IFuturesHistoryPropsState = ReturnType<typeof mapStateToProps>;
type IFuturesHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;

class IndexHistory extends Component<
  IIndexProps & WrappedComponentProps,
  IndexState
> {
  static getDerivedStateFromProps(nextProps: IIndexProps) {
    if (nextProps.markets.length !== 0) {
      return {
        markets: nextProps.markets
      };
    }
    return null;
  }
  columns = [
    {
      title: this.props.intl.formatMessage({ id: "Market" }),
      dataIndex: "contract",
      key: "name",
      render: (item: string, index: ISpotData) => (
        <div className="coin-div">
          <span>{item}</span>
        </div>
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "time",
      key: "age",
      render: (item: string) => (
        <span>
          {moment
            .parseZone(item, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("YYYY-MM-DD HH:mm:ss")}
        </span>
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Side" }),
      dataIndex: "side",
      key: "address",
      render: (item: string) => (
        <span style={{ color: sideType[item] }}>
          {this.props.intl.formatMessage({
            id: _.upperFirst(_.toLower(item)),
            defaultMessage: _.upperFirst(_.toLower(item))
          })}
        </span>
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Type" }),
      key: "tags",
      dataIndex: "type",
      render: (item: string) => (
        <span>
          {this.props.intl.formatMessage({
            id: _.upperFirst(_.toLower(item)),
            defaultMessage: _.upperFirst(_.toLower(item))
          })}
        </span>
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Price" }),
      key: "tags",
      dataIndex: "price",
      render: (item: string) => <span>{checkNumber(item)}</span>
    },
    {
      title: this.props.intl.formatMessage({ id: "Filled" }),
      key: "action",
      dataIndex: "filled",
      render: (item: string) => <span>{checkNumber(item)}</span>
    },
    {
      title: this.props.intl.formatMessage({ id: "Total" }),
      key: "Total",
      dataIndex: "total",
      render: (item: string) => <span>{checkNumber(item)}</span>
    },
    {
      title: this.props.intl.formatMessage({ id: "fee" }),
      key: "fee",
      dataIndex: "fee",
      render: (item: string) => <span>{checkNumber(item)}</span>
    },
    {
      title: this.props.intl.formatMessage({
        id: "Trade Type",
        defaultMessage: "Trade Type"
      }),
      key: "source",
      dataIndex: "source",
      render: (item: number) => <span>{typeSource(item)}</span>
    }
    // {
    //   title: this.props.intl.formatMessage({ id: "Liquidation Trade" }),
    //   key: "liquidationTrade",
    //   dataIndex: "liquidationTrade",
    //   render: (item: boolean) => (
    //     <span>
    //       {item
    //         ? this.props.intl.formatMessage({
    //             id: "Yes",
    //             defaultMessage: "Yes",
    //           })
    //         : this.props.intl.formatMessage({
    //             id: "No",
    //             defaultMessage: "No",
    //           })}
    //     </span>
    //   ),
    // },
  ];
  columnsBottom = [
    {
      title: this.props.intl.formatMessage({ id: "Market" }),
      dataIndex: "contract",
      key: "name",
      render: (item: string, index: IFundingPaymeny) => (
        <div className="contract-div">
          <span
            style={{
              backgroundColor: index.position === "Long" ? "#22C6B9" : "#F73461"
            }}
          >
            {index.position}
          </span>
          <span>{item}</span>
        </div>
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "time",
      key: "age",
      render: (item: string) => <span>{item}</span>
    },
    {
      title: this.props.intl.formatMessage({ id: "Payment" }),
      dataIndex: "payment",
      key: "address",
      render: (item: string) => <span>{item}</span>
    },
    {
      title: this.props.intl.formatMessage({ id: "Rate" }),
      key: "tags",
      dataIndex: "rate",
      render: (item: string) => (
        <span>{(Number(item) * 100).toFixed(4) + "%"}</span>
      )
    }
  ];
  constructor(props: any) {
    super(props);
    this.state = FuturesHistoryState;
  }
  async componentDidMount() {
    this.setState({ loading: 1 });

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
        futurestime: time,
        fundingtime: time
      },
      () => {
        this.getMarketsType();
      }
    );
    const rest = await futuresTypes();
    rest.success &&
      this.setState({
        futuresType: rest.data
      });
    !rest.success && message.warning(messageError(rest.code));
    this.setState({ loading: 0 });
  }
  componentDidUpdate(prevProps: IIndexProps) {
    if (
      prevProps.markets !== this.props.markets &&
      this.props.markets.length !== 0
    ) {
      this.futuresHistoryData();
    }
  }
  futuresHistoryData = async () => {
    const params: ISpotTableData = {
      pageNum: this.state.futuresNum,
      pageSize: this.state.futuresSize,
      searchParams: {
        contract: this.state.Market.length
          ? this.state.Market
          : this.state.type,
        type: ["INDEX"],
        startDate: toUtc(this.state.futurestime[0]),
        endDate: moment(toUtc(this.state.futurestime[1]))
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss")
        // marketType: "INDEX"
      }
    };
    this.props.exportsBack(
      Object.assign(JSON.parse(JSON.stringify(params.searchParams)), {
        startDate: this.state.futurestime[0],
        endDate: this.state.futurestime[1]
      })
    );
    const result = await futuresHistory(params);
    result.success &&
      this.setState({
        futuresData: result.data.data,
        futuresTotal: result.data.total
      });
    !result.success && message.warning(result.message);
  };
  fundingHistoryData = async () => {
    const params: ISpotTableData = {
      pageNum: this.state.fundingNum,
      pageSize: this.state.fundingSize,
      searchParams: {
        contract: [],
        type: [],
        startDate: toUtc(this.state.fundingtime[0]),
        endDate: moment(toUtc(this.state.fundingtime[1]))
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss")
        // marketType: "INDEX"
      }
    };
    const result = await fundingHistory(params);
    result.success &&
      this.setState({
        fundingData: result.data.data,
        fundingTotal: result.data.total
      });
    !result.success && message.warning(result.message);
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
  handleChange = (type: string, e: string[]) => {
    type === "markets" && this.setState({ Market: e });
    type === "type" && this.setState({ typeSelect: e });
  };
  onPickerChange = (type: string, date: any, dateString: string[]) => {
    if (type === "futures") {
      if (comparedDate(dateString)) {
        this.setState({
          futurestime: dateString
        });
      } else {
        message.error(messageError("31002"));
      }
    } else if (type === "funding") {
      if (comparedDate(dateString)) {
        this.setState({
          fundingtime: dateString
        });
      } else {
        message.error(messageError("31002"));
      }
    }
  };
  onPaginationChange = (
    type: number,
    page: number,
    pageSize?: number | undefined
  ) => {
    if (type === 1) {
      this.setState(
        {
          futuresNum: page,
          futuresSize: pageSize!
        },
        () => {
          this.futuresHistoryData();
        }
      );
    } else {
      this.setState(
        {
          fundingNum: page,
          fundingSize: pageSize!
        },
        () => {
          this.fundingHistoryData();
        }
      );
    }
  };
  onShowSizeChange = (type: number, page: number, pageSize: number) => {
    if (type === 1) {
      this.setState(
        {
          futuresNum: page,
          futuresSize: pageSize!
        },
        () => {
          this.futuresHistoryData();
        }
      );
    } else {
      this.setState(
        {
          fundingNum: page,
          fundingSize: pageSize!
        },
        () => {
          this.fundingHistoryData();
        }
      );
    }
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
    if (type === "futures") {
      this.setState(
        {
          futuresNum: 1,
          futuresSize: 10,
          futurestime: time,
          Market: [],
          typeSelect: []
        },
        () => {
          this.futuresHistoryData();
        }
      );
    } else {
      this.setState(
        {
          fundingNum: 1,
          fundingSize: 10,
          fundingtime: time
        },
        () => {
          this.fundingHistoryData();
        }
      );
    }
  };
  getMarketsType = () => {
    getMarketAll().then((res) => {
      if (res.success) {
        const coinOptions: any = res.data.markets
          .filter((i: any) => i.type === "INDEX")
          .map((item: any) => item.marketCode);
        this.setState({ type: [...coinOptions] }, () => {
          this.futuresHistoryData();
          this.fundingHistoryData();
        });
      } else {
        message.warning(res.message);
      }
    });
  };
  render() {
    const { intl } = this.props;
    const {
      futurestime,
      futuresType,
      futuresData,
      futuresTotal,
      Market,
      typeSelect,
      loading
    } = this.state;
    return (
      <Loadding show={loading}>
        <div className="futures-history">
          <div className="spot-history-top">
            <div className="markets">
              <div className="markets-top">
                {intl.formatMessage({ id: "Market" })}
              </div>
              <Select
                className="spot-select"
                style={{ width: 200 }}
                date-type="markets"
                getPopupContainer={(triggerNode) => triggerNode}
                onChange={this.handleChange.bind(this, "markets")}
                mode="multiple"
                maxTagCount={1}
                value={Market}
                maxTagTextLength={10}
                showArrow={true}
                placeholder={intl.formatMessage({ id: "Please_select" })}
              >
                {/* {markets.map((i, index: number) => {
                  return (
                    <Option key={index} value={i}>
                      {i}
                    </Option>
                  );
                })} */}
                {this.state.type &&
                  this.state.type.map((item: any) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
              </Select>
            </div>
            {/* <div className="type">
              <div className="markets-top">
                {intl.formatMessage({ id: "Type" })}
              </div>
              <Select
                className="spot-select"
                style={{ width: 200 }}
                date-type="type"
                getPopupContainer={(triggerNode) => triggerNode}
                onChange={this.handleChange.bind(this, "type")}
                placeholder={intl.formatMessage({ id: "Please_select" })}
                mode="multiple"
                maxTagCount={1}
                value={typeSelect}
                showArrow={true}
                maxTagTextLength={10}
              >
                {Object.values(futuresType).map((i: string, index: number) => {
                  return (
                    <Option key={index} value={Object.keys(futuresType)[index]}>
                      {this.props.intl.formatMessage({
                        id: i,
                        defaultMessage: i
                      })}
                    </Option>
                  );
                })}
              </Select>
            </div> */}
            <div className="date">
              <div className="markets-top">
                {intl.formatMessage({ id: "Date" })}
              </div>
              <RangePicker
                format={"YYYY-MM-DD"}
                value={
                  futurestime && [
                    moment(futurestime[0], "YYYY-MM-DD"),
                    moment(futurestime[1], "YYYY-MM-DD")
                  ]
                }
                separator=" ~ "
                allowClear={false}
                suffixIcon={<Date />}
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
                className="date-picker"
                onChange={this.onPickerChange.bind(this, "futures")}
              />
            </div>
            <div className="spot-search">
              <Button type="text" onClick={this.futuresHistoryData}>
                {this.props.intl.formatMessage({ id: "Search" })}
              </Button>
            </div>
            <div className="spot-btn">
              <Button
                type="text"
                onClick={this.futuresReset.bind(this, "futures")}
              >
                {this.props.intl.formatMessage({ id: "Reset" })}
              </Button>
            </div>
          </div>
          <Table
            className="ant_table"
            columns={this.columns}
            dataSource={futuresData}
            rowKey={(recond) => recond.id}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={empty} alt="empty-table" />
                  <span style={{ marginTop: "12px" }}>
                    {intl.formatMessage({
                      id: "No_Index_History",
                      defaultMessage: "NoIndex History"
                    })}
                  </span>
                </div>
              )
            }}
            pagination={{
              hideOnSinglePage: false,
              pageSizeOptions: ["10", "20", "30"],
              defaultPageSize: 10,
              showQuickJumper: true,
              onShowSizeChange: this.onShowSizeChange.bind(this, 1),
              showSizeChanger: true,
              size: "small",
              total: futuresTotal,
              onChange: this.onPaginationChange.bind(this, 1),
              itemRender: this.itemRender
            }}
          />
          {/* <div className="funding-payments">
            <div className="funding-payments-top">
              {intl.formatMessage({ id: 'Funding_Payments' })}
            </div>
            <div className="funding-box">
              <div>
                {' '}
                <div className="markets-top">
                  {intl.formatMessage({ id: 'Date' })}
                </div>
                <RangePicker
                  format={'YYYY-MM-DD'}
                  value={
                    fundingtime && [
                      moment(fundingtime[0], 'YYYY-MM-DD'),
                      moment(fundingtime[1], 'YYYY-MM-DD'),
                    ]
                  }
                  separator=" ~ "
                  allowClear={false}
                  suffixIcon={<Date />}
                  disabledDate={(current) =>
                    current && current > moment().endOf('day')
                  }
                  className="date-picker"
                  onChange={this.onPickerChange.bind(this, 'funding')}
                />
              </div>
              <div className="spot-search">
                <Button type="text" onClick={this.fundingHistoryData}>
                  {intl.formatMessage({ id: 'Search' })}
                </Button>
              </div>
              <div className="spot-btn">
                <Button
                  type="text"
                  onClick={this.futuresReset.bind(this, 'funding')}
                >
                  {intl.formatMessage({ id: 'Reset' })}
                </Button>
              </div>
            </div>
            <Table
              className="ant_table"
              columns={this.columnsBottom}
              dataSource={fundingData}
              rowKey={(recond) => recond.id}
              scroll={{ x: true }}
              locale={{
                emptyText: (
                  <div className="empty-table">
                    <img src={empty} alt="empty-table" />
                    <span style={{ marginTop: '12px' }}>
                      {intl.formatMessage({ id: 'No_Data' })}
                    </span>
                  </div>
                ),
              }}
              pagination={{
                hideOnSinglePage: false,
                pageSizeOptions: ['10', '20', '30'],
                defaultPageSize: 10,
                showQuickJumper: true,
                onShowSizeChange: this.onShowSizeChange.bind(this, 2),
                showSizeChanger: true,
                size: 'small',
                total: fundingTotal,
                onChange: this.onPaginationChange.bind(this, 2),
                itemRender: this.itemRender,
              }}
            />
          </div> */}
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(IndexHistory));
