import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  IRepoStates,
  IRepoOutput,
  IRepoPropsInput,
  Date,
  prev,
  next,
  IRepoParams,
} from "./type";
import _ from "lodash";
import { Row, Select, DatePicker, Button, Table, message } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { PrevDay, comparedDate, messageError } from "utils";
import {
  getMarketAll,
  getRepoHistory,
  getSelectMarket,
} from "service/http/http";
import { TableNoData } from "components/publicComponent/publicComponent";
import { Loadding } from "components/loadding";
import { EnumSideColor } from "schemas/index.enum";
import { injectIntl, WrappedComponentProps } from "react-intl";
import "./repo.scss";
import { toLocaleString } from "utils/toLocaleString";
import { typeSource } from "../../data";
// import { DownSelect } from "assets/image";

const { Option } = Select;
const { RangePicker } = DatePicker;

type IRepoPropsState = ReturnType<typeof mapStateToProps>;
type IRepoDispatchState = ReturnType<typeof mapDispatchToProps>;

type IRepoProps = IRepoPropsState & IRepoDispatchState & IRepoPropsInput;
class Repo extends PureComponent<
  IRepoProps & WrappedComponentProps,
  IRepoStates
> {
  static getDerivedStateFromProps(
    nextProps: IRepoProps,
    nextState: IRepoStates
  ) {
    if (nextProps.markets !== nextState.markets) {
      return {
        markets: nextProps.markets,
      };
    }
    return null;
  }
  readonly state: IRepoStates = {
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
        contract: [],
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1],
        type: ["REPO"],
      },
    },
    marketsType: [],
  };
  columns: ColumnsType<IRepoOutput> = [
    {
      title: this.props.intl.formatMessage({ id: "Contract" }),
      dataIndex: "contract",
      key: "contract",
    },
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "time",
      key: "time",
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
      render: (item) => {
        return (
          <span
            style={{
              color: (EnumSideColor as { [key: string]: string })[item],
            }}
          >
            {this.props.intl.formatMessage({
              id: _.upperFirst(_.toLower(item)),
              defaultMessage: _.upperFirst(_.toLower(item)),
            })}
          </span>
        );
      },
    },
    {
      title: this.props.intl.formatMessage({ id: "Price" }),
      key: "price",
      dataIndex: "price",
      render: (e) => toLocaleString(e) + "%",
    },
    {
      title: this.props.intl.formatMessage({ id: "Filled" }),
      dataIndex: "filled",
      key: "filled",
    },
    {
      title: this.props.intl.formatMessage({ id: "Leg_1_Price" }),
      dataIndex: "leg1",
      key: "leg1",
    },
    {
      title: this.props.intl.formatMessage({ id: "Leg_2_Price" }),
      dataIndex: "leg2",
      key: "leg2",
    },
    {
      title: this.props.intl.formatMessage({ id: "Total" }),
      dataIndex: "total",
      key: "total",
      render: (e) => toLocaleString(e),
    },
    {
      title: "Fee (Currency)",
      dataIndex: "fee",
      key: "fee",
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
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }
  componentDidUpdate(nextProps: IRepoProps, nextState: IRepoStates) {
    if (nextProps.markets !== this.props.markets) {
      this.setState({ markets: this.props.markets }, () => {
        this.getResult();
      });
    }
    if (nextState.params.searchParams !== this.state.params.searchParams) {
      this.props.exportsBack(this.state.params.searchParams);
    }
  }
  async getResult() {
    this.setState({ loading: 1 });
    const param: IRepoParams = JSON.parse(JSON.stringify(this.state.params));
    param.searchParams.startDate = moment(param.searchParams.startDate)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    param.searchParams.endDate = moment(param.searchParams.endDate)
      .add(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    if (!param.searchParams.contract.length) {
      param.searchParams.contract = this.state.marketsType.map((i) => i.value);
      this.props.exportsBack(
        Object.assign(
          JSON.parse(JSON.stringify(this.state.params.searchParams)),
          {
            contract: param.searchParams.contract,
          }
        )
      );
    }
    const result = await getRepoHistory(param);
    result.success && this.setState({ result: result.data });
    !result.success && message.warn(result.message);
    this.setState({ loading: 0 });
  }
  marketChange(item: string[]) {
    this.setState(
      {
        params: {
          ...this.state.params,
          searchParams: {
            ...this.state.params.searchParams,
            contract: item,
          },
        },
      },
      () => {
        this.getResult();
      }
    );
  }
  reset() {
    this.setState(
      {
        params: {
          pageNum: 1,
          pageSize: 10,
          searchParams: {
            contract: [],
            startDate: PrevDay(1, "weeks")[0],
            endDate: PrevDay(1, "weeks")[1],
            type: ["REPO"],
          },
        },
      },
      () => {
        this.getResult();
      }
    );
  }
  componentDidMount() {
    this.onMarkets();
    this.props.exportsBack(this.state.params.searchParams);
  }
  onMarkets = async () => {
    const result = await getSelectMarket("REPO");
    if (result.success) {
      const arr = [];
      Object.keys(result?.data).forEach((i) => {
        arr.push({ name: i, value: result?.data[i] });
      });

      this.setState({ marketsType: arr }, () => {
        this.getResult();
      });
    }
  };

  render() {
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loading}>
        <Row className="repo">
          <Row className="repo-search">
            <Row className="repo-subSearch">
              <Row>{intl.formatMessage({ id: "Market" })}</Row>
              <Select
                mode="multiple"
                placeholder={intl.formatMessage({ id: "Please_select" })}
                onChange={this.marketChange.bind(this)}
                maxTagCount={1}
                maxTagTextLength={10}
                value={this.state.params.searchParams.contract}
                showArrow={true}
              >
                {this.state.marketsType.map((i, index: number) => (
                  <Option key={i.name} value={i.value}>
                    {i.name}
                  </Option>
                ))}
              </Select>
            </Row>
            <Row className="repo-subSearch">
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
                              "YYYY-MM-DD 00:00:00"
                            ),
                            endDate: moment(last).format("YYYY-MM-DD 23:59:59"),
                          },
                        },
                      },
                      () => {
                        this.getResult();
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
            <Row className="repo-subSearch">
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
              emptyText: TableNoData(
                intl.formatMessage({ id: "No_Repo_History" })
              ),
            }}
            rowKey={(record) => {
              return record.id;
            }}
            pagination={{
              total: this.state.result.total,
              defaultPageSize: 10,
              showQuickJumper: true,
              showSizeChanger: true,
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
const mapStateToProps = (state: null) => {
  return {};
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Repo));
