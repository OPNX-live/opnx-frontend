import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, DatePicker, Table, Button, message } from "antd";
import {
  prev,
  next,
  Date,
  SpotHistoryState,
  SpotState,
  ISpotTableData,
  ISpotProps,
} from "./type";
import { PrevDay, comparedDate, toUtc } from "utils/utils";
import _ from "lodash";
import "./spotHistory.scss";
import moment from "moment";
import {
  getMarketAll,
  getSelectMarket,
  spotHistory,
  spotTypes,
} from "service/http/http";
import empty from "assets/image/empty-table.png";
import { messageError } from "utils";
import { checkNumber } from "../futuresHistory/type";
import { EnumSideColor } from "schemas/index.enum";
import { Loadding } from "components/loadding";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { typeSource } from "../../data";
const { RangePicker } = DatePicker;
const sideType: { [key: string]: string } = EnumSideColor;
const { Option } = Select;
type ISpotHistoryPropsState = ReturnType<typeof mapStateToProps>;
type ISpotHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;

class SpotHistory extends Component<
  ISpotProps & WrappedComponentProps,
  SpotState
> {
  static getDerivedStateFromProps(nextProps: ISpotProps) {
    if (nextProps.markets.length !== 0) {
      return {
        markets: nextProps.markets,
      };
    }
    return null;
  }
  columns = [
    {
      title: this.props.intl.formatMessage({ id: "Market" }),
      dataIndex: "contract",
      key: "name",
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
      ),
    },
    {
      title: this.props.intl.formatMessage({ id: "Side" }),
      dataIndex: "side",
      key: "side",
      render: (item: string) => (
        <span style={{ color: sideType[item] }}>
          {this.props.intl.formatMessage({
            id: _.upperFirst(_.toLower(item)),
            defaultMessage: _.upperFirst(_.toLower(item)),
          })}
        </span>
      ),
    },
    {
      title: this.props.intl.formatMessage({ id: "Type" }),
      key: "tags",
      dataIndex: "type",
      render: (item: string) => (
        <span>
          {this.props.intl.formatMessage({
            id: _.upperFirst(_.toLower(item)),
            defaultMessage: _.upperFirst(_.toLower(item)),
          })}
        </span>
      ),
    },
    {
      title: this.props.intl.formatMessage({ id: "Price" }),
      key: "tags",
      dataIndex: "price",
      render: (item: string) => <span>{checkNumber(item)}</span>,
    },
    {
      title: this.props.intl.formatMessage({ id: "Filled" }),
      key: "action",
      dataIndex: "filled",
      render: (item: string) => <span>{checkNumber(item)}</span>,
    },
    {
      title: this.props.intl.formatMessage({ id: "Total" }),
      key: "Total",
      dataIndex: "total",
      render: (item: string) => <span>{checkNumber(item)}</span>,
    },
    {
      title: "Fee (Currency)",
      key: "fee",
      dataIndex: "fee",
      render: (item: string) => <span>{checkNumber(item)}</span>,
    },
    {
      title: this.props.intl.formatMessage({
        id: "Trade Type",
        defaultMessage: "Trade Type",
      }),
      key: "tradeType",
      dataIndex: "tradeType",
    },
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
  constructor(props: any) {
    super(props);
    this.state = SpotHistoryState;
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
        // .add(1, "day")
        .utc()
        .format("YYYY-MM-DD HH:mm:ss"),
    ];
    this.setState(
      {
        spotTime: time,
      },
      () => {
        this.onMarkets();
      }
    );
    const rest = await spotTypes();
    rest.success &&
      this.setState({
        SpotType: rest.data,
      });
    !rest.success && message.warning(messageError(rest.code));
    this.setState({ loading: 0 });
  }
  spotRest = () => {
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
        Market: [],
        pageNum: 1,
        pageSize: 10,
        spotTime: time,
        typeSelect: [],
      },
      () => {
        this.historyData();
      }
    );
  };

  onMarkets = async () => {
    const result = await getSelectMarket("SPOT");
    if (result.success) {
      const arr = [];
      Object.keys(result?.data).forEach((i) => {
        arr.push({ name: i, value: result?.data[i] });
      });

      this.setState({ marketsType: arr }, () => {
        this.historyData();
      });
    }
  };
  historyData = async () => {
    this.setState({ loading: 1 });
    const params: ISpotTableData = {
      pageNum: this.state.pageNum,
      pageSize: this.state.pageSize,
      searchParams: {
        contract: this.state.Market.length
          ? this.state.Market
          : this.state.marketsType.map((i) => i.value),
        type: ["SPOT"],
        startDate: toUtc(this.state.spotTime[0]),
        endDate: moment(toUtc(this.state.spotTime[1]))
          .add(1, "day")
          .format("YYYY-MM-DD HH:mm:ss"),
      },
    };
    if (params.searchParams.contract.length) {
      this.props.exportsBack(
        Object.assign(JSON.parse(JSON.stringify(params.searchParams)), {
          startDate: this.state.spotTime[0],
          endDate: this.state.spotTime[1],
        })
      );
      const result = await spotHistory(params);
      result.success &&
        this.setState({
          spotData: result.data.data,
          total: result.data.total,
        });
      !result.success && message.warning(result.message);
      this.setState({ loading: 0 });
    }
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
  // handleChange = (e: string[]) => {
  //   this.setState(
  //     {
  //       Market: e,
  //     }
  //   );
  // };
  handleChange = (type: string, e: string[]) => {
    type === "markets" && this.setState({ Market: e });
    type === "type" && this.setState({ typeSelect: e });
  };
  onPanelChange = (date: any, dateString: string[]) => {
    if (comparedDate(dateString)) {
      const time = [
        moment
          .parseZone(dateString[0], "YYYY-MM-DD HH:mm:ss")
          .local()
          .format("YYYY-MM-DD HH:mm:ss"),
        moment
          .parseZone(dateString[1], "YYYY-MM-DD HH:mm:ss")
          .local()
          .format("YYYY-MM-DD HH:mm:ss"),
      ];
      this.setState({
        spotTime: time,
      });
    } else {
      message.error(messageError("31002"));
    }
  };
  onPaginationChange = (page: number, pageSize?: number | undefined) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize!,
      },
      () => {
        this.historyData();
      }
    );
  };
  onShowSizeChange = (page: number, pageSize: number) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize!,
      },
      () => {
        this.historyData();
      }
    );
  };
  render() {
    const { intl } = this.props;
    const {
      spotTime,
      spotData,
      Market,
      loading,
      SpotType,
      typeSelect,
      marketsType,
    } = this.state;
    return (
      <Loadding show={loading}>
        <div className="spot-history">
          <div className="spot-history-top">
            <div className="markets">
              <div className="markets-top">
                {intl.formatMessage({ id: "Market" })}
              </div>
              <Select
                className="spot-select"
                style={{ width: 200 }}
                onChange={this.handleChange.bind(this, "markets")}
                mode="multiple"
                maxTagCount={1}
                showArrow={true}
                maxTagTextLength={10}
                placeholder={intl.formatMessage({ id: "Please_select" })}
                value={Market}
              >
                {marketsType.map((i, index: number) => (
                  <Option key={i.name} value={i.value}>
                    {i.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="date">
              <div className="markets-top">
                {intl.formatMessage({ id: "Date" })}
              </div>
              <RangePicker
                format={"YYYY-MM-DD"}
                suffixIcon={<Date />}
                onChange={this.onPanelChange}
                separator=" ~ "
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
                allowClear={false}
                value={
                  spotTime && [
                    moment(spotTime[0], "YYYY-MM-DD"),
                    moment(spotTime[1], "YYYY-MM-DD"),
                  ]
                }
                className="date-picker"
              />
            </div>
            <div className="spot-search">
              <Button type="text" onClick={this.historyData}>
                {intl.formatMessage({ id: "Search" })}
              </Button>
            </div>
            <div className="spot-btn">
              <Button type="text" onClick={this.spotRest}>
                {intl.formatMessage({ id: "Reset" })}
              </Button>
            </div>
          </div>
          <Table
            className="ant_table"
            columns={this.columns}
            dataSource={spotData}
            rowKey={(recond) => recond.id}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={empty} alt="empty-table" />
                  <span style={{ marginTop: "12px" }}>
                    {intl.formatMessage({ id: "No_Spot_History" })}
                  </span>
                </div>
              ),
            }}
            pagination={{
              hideOnSinglePage: false,
              pageSizeOptions: ["10", "20", "30"],
              defaultPageSize: 10,
              showQuickJumper: true,
              total: this.state.total,
              showSizeChanger: true,
              onChange: this.onPaginationChange,
              size: "small",
              onShowSizeChange: this.onShowSizeChange,
              itemRender: this.itemRender,
            }}
          />
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
)(injectIntl(SpotHistory));
