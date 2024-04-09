import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  IRedeemStates,
  prev,
  next,
  Date,
  IRedeemOutput,
  IRedeemParams,
  dayFormat,
} from "./type";
import "./redeem.scss";
import { Row, DatePicker, Button, Table, message, Select } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { PrevDay, comparedDate, messageError, guid } from "utils";
import { getLendPool, lendHistory } from "service/http/http";
import { TableNoData } from "components/publicComponent/publicComponent";
import { Loadding } from "components/loadding";
import { injectIntl, WrappedComponentProps } from "react-intl";
const { Option } = Select;
const { RangePicker } = DatePicker;
type IRedeemPropsState = ReturnType<typeof mapStateToProps>;
type IRedeemDispatchState = ReturnType<typeof mapDispatchToProps>;

type IRedeemProps = IRedeemPropsState & IRedeemDispatchState;
class RedeemHistort extends PureComponent<
  IRedeemProps & WrappedComponentProps,
  IRedeemStates
> {
  static getDerivedStateFromProps(
    nextProps: IRedeemProps,
    nextState: IRedeemStates
  ) {
    // if (nextProps.markets !== nextState.markets) {
    //   return {
    //     markets: nextProps.markets,
    //   };
    // }
    return null;
  }
  readonly state: IRedeemStates = {
    loading: 0,
    markets: [],
    result: {
      data: [],
      total: 0,
    },
    params: {
      pageNum: 1,
      pageSize: 10,
      searchParams: {
        type: "WITHDRAWAL",
        collateral: "",
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1],
        accountId: this.props.dashboardUserData.accountId,
        poolId: "",
      },
    },
    lendPool:{},
    times: { h: "00", m: "00", s: "00" },
  };
  columns: ColumnsType<IRedeemOutput> = [
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "requestAt",
      key: "requestAt",
      render: (item: string) => (
        <span>
          {moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      title: "Pool Type",
      dataIndex: "poolType",
      key: "poolType",
      render: (item: string) => this.formatInitial(item),
    },
    {
      title: this.props.intl.formatMessage({ id: "Amount" }),
      key: "amount",
      dataIndex: "amount",
    },
    {
      title: "Business Type",
      dataIndex: "businessType",
      key: "businessType",
      render: (item: string) => this.formatInitial(item),
    },
    {
      title: this.props.intl.formatMessage({ id: "Status" }),
      dataIndex: "executionStatus",
      key: "executionStatus",
      render: (item: string) => this.formatInitial(item),
    },
  ];
  private timer: NodeJS.Timeout | null = null;
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }
  async getResult() {
    this.setState({ loading: 1 });
    const param: IRedeemParams = JSON.parse(JSON.stringify(this.state.params));
    param.searchParams.startDate = moment(param.searchParams.startDate)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    param.searchParams.endDate = moment(param.searchParams.endDate)
      .utc()
      .add(1, "day")
      .format("YYYY-MM-DD HH:mm:ss");
    const result = await lendHistory(param);
    const time: number =
      result.success &&
      result.data.data.length &&
      result.data.data[0].length &&
      result.data.data[0][0].rewardTime;
    if (time) {
      this.timer = setInterval(() => {
        if (dayFormat(time.toString()).isTimer) {
          clearInterval(this.timer!);
          this.getResult();
          return;
        }
        dayFormat(time.toString());
        this.setState({
          times: {
            h: dayFormat(time.toString()).h,
            m: dayFormat(time.toString()).m,
            s: dayFormat(time.toString()).s,
          },
        });
      }, 1000);
    }
    result.success && this.setState({ result: result.data });
    !result.success && message.warn(result.message);
    this.setState({ loading: 0 });
  }
  componentWillUnmount() {
    clearInterval(this.timer!);
  }
  reset() {
    this.setState(
      {
        params: {
          pageNum: 1,
          pageSize: 10,
          searchParams: {
            type: "WITHDRAWAL",
            startDate: PrevDay(1, "weeks")[0],
            endDate: PrevDay(1, "weeks")[1],
            accountId: this.props.dashboardUserData.accountId,
            collateral: "",
            poolId: "",
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
    this.lendPool()
    // this.props.exportsBack(this.state.params.searchParams);
  }
  formatInitial(value: string) {
    if (value) {
      const LowerCase = value.toLocaleLowerCase();
      return LowerCase.slice(0, 1).toLocaleUpperCase() + LowerCase.slice(1);
    }
    return "--";
  }
  async lendPool() {
    const res = await getLendPool();
    if (res.success) {
      this.setState({ lendPool: res.data });
    }
  }
  render() {
    const { intl } = this.props;
    const { params,lendPool } = this.state;
    return (
      <Loadding show={this.state.loading}>
        <Row className="redeem">
          <Row className="redeem-search">
          <Row className="redeem-subSearch">
            <Row>Pool Type</Row>
            <Select
              className="spot-select"
              style={{ width: 200 }}
              onChange={(e) => {
                this.setState(
                  {
                    params: {
                      ...params,
                      searchParams: {
                        ...this.state.params.searchParams,
                        poolId: e,
                      },
                    },
                  },
                );
              }}
              maxTagCount={1}
              showArrow={true}
              placeholder={"Please select"}
              value={params?.searchParams?.poolId || "Please select"}
            >
              {Object.keys(lendPool).map((i, index) => {
                  return (
                    <Option key={index} value={i}>
                      {lendPool[i]}
                    </Option>
                  );
                })}
            </Select>
           </Row>
            <Row className="redeem-subSearch">
              <Row>{intl.formatMessage({ id: "Date" })}</Row>
              <RangePicker
                format={"YYYY-MM-DD"}
                suffixIcon={<Date />}
                separator=" ~ "
                onChange={(date, [first, last]) => {
                  if (comparedDate([first, last])) {
                    this.setState(
                      {
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
                      }
                    );
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
            <Row className="redeem-subSearch">
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(RedeemHistort));
