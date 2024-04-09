import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  IoUSDStates,
  prev,
  next,
  Date,
  IoUSDPropsInput,
  IoUSDOutput,
  IoUSDParams,
} from "./type";
import "./oUSD.scss";
import { Row, DatePicker, Button, Table, message, Select } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { PrevDay, comparedDate, messageError, guid, toThousands } from "utils";
import { getOUSDHistory } from "service/http/http";
import { TableNoData } from "components/publicComponent/publicComponent";
import { Loadding } from "components/loadding";
import { injectIntl, WrappedComponentProps } from "react-intl";
const { Option } = Select;

const { RangePicker } = DatePicker;
type IoUSDPropsState = ReturnType<typeof mapStateToProps>;
type IoUSDDispatchState = ReturnType<typeof mapDispatchToProps>;

type IoUSDProps = IoUSDPropsState & IoUSDDispatchState & IoUSDPropsInput;
class oUSD extends PureComponent<
  IoUSDProps & WrappedComponentProps,
  IoUSDStates
> {
  static getDerivedStateFromProps(
    nextProps: IoUSDProps,
    nextState: IoUSDStates
  ) {
    // if (nextProps.type !== nextState.type) {
    //   return {
    //     type: nextProps.type,
    //   };
    // }
    return null;
  }
  readonly state: IoUSDStates = {
    loading: 0,
    type: "",
    result: {
      data: [],
      total: 0,
    },
    params: {
      pageNum: 1,
      pageSize: 10,
      searchParams: {
        type: "",
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1],
      },
    },
    lendPool: {},
  };
  columns: ColumnsType<IoUSDOutput> = [
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "requestTime",
      key: "requestTime",
      render: (item: string) =>
        moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Amount",
      key: "quantity",
      dataIndex: "quantity",
      render: (item: string) => toThousands(item),
    },
    {
      title: "From Coin",
      dataIndex: "fromCoin",
      key: "fromCoin",
    },
    {
      title: "To Coin",
      dataIndex: "toCoin",
      key: "toCoin",
    },
    {
      title: this.props.intl.formatMessage({ id: "Status" }),
      dataIndex: "status",
      key: "status",
      render: (item: string) => this.formatInitial(item),
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }

  async getResult() {
    this.setState({ loading: 1 });
    const param: IoUSDParams = JSON.parse(JSON.stringify(this.state.params));
    param.searchParams.startDate = moment(param.searchParams.startDate)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    param.searchParams.endDate = moment(param.searchParams.endDate)
      .utc()
      .add(1, "day")
      .format("YYYY-MM-DD HH:mm:ss");

    const result = await getOUSDHistory(param);
    result.success && this.setState({ result: result.data || [] });
    !result.success && message.warn(result.message);
    this.setState({ loading: 0 });
  }
  reset() {
    this.setState(
      {
        params: {
          pageNum: 1,
          pageSize: 10,
          searchParams: {
            type: "",
            startDate: PrevDay(1, "weeks")[0],
            endDate: PrevDay(1, "weeks")[1],
          },
        },
      },
      () => {
        this.getResult();
      }
    );
  }
  componentDidMount() {
    this.getResult();
  }
  formatInitial(value: string) {
    if (value) {
      const LowerCase = value.toLocaleLowerCase();
      return LowerCase.slice(0, 1).toLocaleUpperCase() + LowerCase.slice(1);
    }
    return "--";
  }
  render() {
    const { intl } = this.props;
    const { params, lendPool } = this.state;
    return (
      <Loadding show={this.state.loading}>
        <Row className="oUSD">
          <Row className="oUSD-search">
            <Row className="oUSD-subSearch">
              <Row>Pool Type</Row>
              <Select
                className="spot-select"
                style={{ width: 200 }}
                onChange={(e) => {
                  this.setState({
                    params: {
                      ...params,
                      searchParams: {
                        ...this.state.params.searchParams,
                        type: e,
                      },
                    },
                  });
                }}
                showArrow={true}
                placeholder={"Please select"}
                value={params.searchParams.type}
              >
                <Option value={""}>All</Option>
                <Option value={"oUSD_MINT"}>Mint</Option>
                <Option value={"oUSD_REDEEM"}>Redeem</Option>
              </Select>
            </Row>

            <Row className="oUSD-subSearch">
              <Row>{intl.formatMessage({ id: "Date" })}</Row>
              <RangePicker
                format={"YYYY-MM-DD"}
                suffixIcon={<Date />}
                separator=" ~ "
                onChange={(date, [first, last]) => {
                  if (comparedDate([first, last])) {
                    this.setState({
                      params: {
                        ...this.state.params,
                        searchParams: {
                          ...this.state.params.searchParams,
                          startDate: moment(first).format(
                            "YYYY-MM-DD HH:mm:ss"
                          ),
                          endDate: moment(last).format("YYYY-MM-DD HH:mm:ss"),
                        },
                      },
                    });
                  } else {
                    message.error(messageError("31002"));
                  }
                }}
                allowClear={false}
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
                value={[
                  moment(
                    this.state.params.searchParams.startDate,
                    "YYYY/MM/DD"
                  ),
                  moment(this.state.params.searchParams.endDate, "YYYY/MM/DD"),
                ]}
              />
            </Row>
            <Row className="oUSD-subSearch">
              <div className="btns">
                <Button type="primary" onClick={this.getResult.bind(this)}>
                  {intl.formatMessage({ id: "Search" })}
                </Button>
                <Button type="text" onClick={this.reset.bind(this)}>
                  {intl.formatMessage({ id: "Reset" })}
                </Button>
              </div>
            </Row>
          </Row>
          <Table
            columns={this.columns}
            dataSource={this.state.result.data}
            scroll={{ x: true }}
            locale={{
              emptyText: TableNoData(intl.formatMessage({ id: "No_History" })),
            }}
            rowKey={(record) => guid()}
            pagination={{
              total: this.state.result.total,
              defaultPageSize: 10,
              showQuickJumper: true,
              showSizeChanger: true,
              hideOnSinglePage: true,
              size: "small",
              current: this.state.params.pageNum,
              pageSize: this.state.params.pageSize,
              onChange: (pageNum, pageSize) => {
                this.setState(
                  {
                    params: {
                      ...this.state.params,
                      pageNum,
                      pageSize: pageSize as number,
                    },
                  },
                  () => {
                    this.getResult();
                  }
                );
              },
              itemRender: (
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
              },
            }}
          />
        </Row>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: any) => {
  return { dashboardUserData: state.dashboardUserData };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(oUSD));
