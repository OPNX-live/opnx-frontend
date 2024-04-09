import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  ISpreadStates,
  prev,
  next,
  Date,
  ISpreadPropsInput,
  ISpreadOutput,
  ISpreadParams
} from "./type";
import _ from "lodash";
import "./spread.scss";
import { Row, Select, DatePicker, Button, Table, message } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { PrevDay, comparedDate, messageError } from "utils";
import { getMarketAll, getSpreadHistory } from "service/http/http";
import { TableNoData } from "components/publicComponent/publicComponent";
import { Loadding } from "components/loadding";
import { EnumSideColor } from "schemas/index.enum";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { toLocaleString } from "utils/toLocaleString";
import { typeSource } from "../../data";
const { Option } = Select;
const { RangePicker } = DatePicker;
type ISpreadPropsState = ReturnType<typeof mapStateToProps>;
type ISpreadDispatchState = ReturnType<typeof mapDispatchToProps>;

type ISpreadProps = ISpreadPropsState &
  ISpreadDispatchState &
  ISpreadPropsInput;
class Spread extends PureComponent<
  ISpreadProps & WrappedComponentProps,
  ISpreadStates
> {
  static getDerivedStateFromProps(
    nextProps: ISpreadProps,
    nextState: ISpreadStates
  ) {
    if (nextProps.markets !== nextState.markets) {
      return {
        markets: nextProps.markets
      };
    }
    return null;
  }
  readonly state: ISpreadStates = {
    loading: 0,
    markets: [],
    result: {
      data: [],
      total: 0
    },
    params: {
      pageNum: 1,
      pageSize: 10,
      searchParams: {
        contract: [],
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1],
        type: ["SPREAD"]
      }
    },
    marketsType: []
  };
  columns: ColumnsType<ISpreadOutput> = [
    {
      title: this.props.intl.formatMessage({ id: "Contract" }),
      dataIndex: "contract",
      key: "contract"
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
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Side" }),
      dataIndex: "side",
      key: "side",
      render: (item) => {
        return (
          <span
            style={{
              color: (EnumSideColor as { [key: string]: string })[item]
            }}
          >
            {this.props.intl.formatMessage({
              id: _.upperFirst(_.toLower(item)),
              defaultMessage: _.upperFirst(_.toLower(item))
            })}
          </span>
        );
      }
    },
    {
      title: this.props.intl.formatMessage({ id: "Price" }),
      key: "price",
      dataIndex: "price",
      render: (e) => toLocaleString(e)
    },
    {
      title: this.props.intl.formatMessage({ id: "Filled" }),
      dataIndex: "filled",
      key: "filled"
    },
    {
      title: this.props.intl.formatMessage({ id: "Leg_1_Price" }),
      dataIndex: "leg1",
      key: "leg1"
    },
    {
      title: this.props.intl.formatMessage({ id: "Leg_2_Price" }),
      dataIndex: "leg2",
      key: "leg2"
    },
    {
      title: this.props.intl.formatMessage({ id: "Total" }),
      dataIndex: "total",
      key: "total",
      render: (e) => toLocaleString(e)
    },
    {
      title: this.props.intl.formatMessage({ id: "fee" }),
      dataIndex: "fee",
      key: "fee"
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
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }
  componentDidUpdate(nextProps: ISpreadProps, nextState: ISpreadStates) {
    if (nextProps.markets !== this.props.markets) {
      this.setState(
        {
          markets: this.props.markets
        },
        () => {
          this.getResult();
        }
      );
    }
    if (nextState.params.searchParams !== this.state.params.searchParams) {
      this.props.exportsBack(this.state.params.searchParams);
    }
  }
  async getResult() {
    this.setState({ loading: 1 });
    const param: ISpreadParams = JSON.parse(JSON.stringify(this.state.params));
    param.searchParams.startDate = moment(param.searchParams.startDate)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    param.searchParams.endDate = moment(param.searchParams.endDate)
      .add(1, "day")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    if (!param.searchParams.contract.length) {
      param.searchParams.contract = this.state.marketsType;
      this.props.exportsBack(
        Object.assign(
          JSON.parse(JSON.stringify(this.state.params.searchParams)),
          {
            contract: param.searchParams.contract
          }
        )
      );
    }
    const result = await getSpreadHistory(param);
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
            contract: item
          }
        }
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
            type: ["SPREAD"]
          }
        }
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
    const result = await getMarketAll();
    if (result.success) {
      const arr = result.data?.markets
        .filter((item: any) => item.type === "SPOT")
        .map((item: any) => item.marketCode);
      this.setState({ marketsType: arr }, () => {
        this.getResult();
      });
    }
  };

  render() {
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loading}>
        <Row className="spread">
          <Row className="spread-search">
            <Row className="spread-subSearch">
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
                  <Option key={index} value={i}>
                    {i}
                  </Option>
                ))}
              </Select>
            </Row>
            <Row className="spread-subSearch">
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
                            endDate: moment(last).format("YYYY-MM-DD 23:59:59")
                          }
                        }
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
                  moment(this.state.params.searchParams.endDate, "YYYY/MM/DD")
                ]}
              />
            </Row>
            <Row className="spread-subSearch">
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
                intl.formatMessage({ id: "No_Spread_History" })
              )
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
                      pageSize: pageSize as number
                    }
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
              }
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Spread));
