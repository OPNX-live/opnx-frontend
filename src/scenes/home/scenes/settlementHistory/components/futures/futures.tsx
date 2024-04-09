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
import "./futures.scss";
import { Row, DatePicker, Button, Table, message, Input } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { PrevDay, comparedDate, messageError } from "utils";
import { getSeetingFutures } from "service/http/http";
import { TableNoData } from "components/publicComponent/publicComponent";
import { Loadding } from "components/loadding";
import { injectIntl, WrappedComponentProps } from "react-intl";
const { RangePicker } = DatePicker;
type ISpreadPropsState = ReturnType<typeof mapStateToProps>;
type ISpreadDispatchState = ReturnType<typeof mapDispatchToProps>;

type ISpreadProps = ISpreadPropsState &
  ISpreadDispatchState &
  ISpreadPropsInput;
enum EnumContracts {
  "Long" = "#22c6b9",
  "Short" = "#f73460"
}
class FuturesHistory extends PureComponent<
  ISpreadProps & WrappedComponentProps,
  ISpreadStates
> {
  enumContracts: { [key: string]: string } = EnumContracts;
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
        // contract: undefined,
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1]
      }
    }
  };

  columns: ColumnsType<ISpreadOutput> = [
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "time",
      key: "time",
      width: "25%",
      render: (item: string) => (
        <span>{moment(item).format("YYYY/MM/DD HH:mm:ss")}</span>
      )
    },
    // {
    //   title: this.props.intl.formatMessage({ id: 'SettlementContract' }),
    //   dataIndex: 'contract',
    //   key: 'contract',
    //   render: (item: string, row: any) => (
    //     <div className="contract">
    //       {/* {row.direction === 'Long' ? (
    //         <img src={long} alt="long" />
    //       ) : (
    //         <img src={short} alt="short" />
    //       )} */}
    //       <div
    //         style={{
    //           width: '32px',
    //           height: '16px',
    //           backgroundColor: this.enumContracts[row.direction],
    //           display: 'flex',
    //           alignItems: 'center',
    //           justifyContent: 'center',
    //           fontSize: '12px',
    //           color: '#E5DFF5',
    //           marginRight: '4px',
    //           borderRadius: '2px',
    //         }}
    //       >
    //         {this.props.intl.formatMessage({
    //           id: row.direction,
    //           defaultMessage: row.direction,
    //         })}
    //       </div>
    //       <div>{item}</div>
    //     </div>
    //   ),
    // },
    {
      title: this.props.intl.formatMessage({ id: "SettlementContract" }),
      dataIndex: "marketCode",
      key: "marketCode",
      width: "25%"
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      key: "qty",
      width: "25%"
    },
    {
      title: this.props.intl.formatMessage({
        id: "Trade Type"
      }),
      dataIndex: "tradeType",
      key: "tradeType",
      width: "25%"
    }
    // {
    //   title: this.props.intl.formatMessage({ id: 'ToContract' }),
    //   key: 'toContract',
    //   dataIndex: 'toContract',
    //   render: (item: string) => (
    //     <span>{this.props.intl.formatMessage({ id: item })}</span>
    //   ),
    // },
    // {
    //   title: this.props.intl.formatMessage({ id: "Qty" }),
    //   dataIndex: "deliveryQty",
    //   key: "deliveryQty"
    // }
  ];
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
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

    const result = await getSeetingFutures(param);
    result.success && this.setState({ result: result.data });
    !result.success && message.warn(result.message);
    this.setState({ loading: 0 });
  }
  marketChange = (e: any) => {
    const { params } = this.state;
    this.setState(
      {
        params: {
          ...params,
          searchParams: {
            ...params.searchParams,
            contract: e.target?.value
          }
        }
      },
      () => {
        this.getResult();
      }
    );
  };
  reset() {
    this.setState(
      {
        params: {
          pageNum: 1,
          pageSize: 10,
          searchParams: {
            contract: undefined,
            startDate: PrevDay(1, "weeks")[0],
            endDate: PrevDay(1, "weeks")[1]
          }
        }
      },
      () => {
        this.getResult();
      }
    );
  }
  componentDidMount() {
    this.getResult();
  }

  render() {
    const { intl } = this.props;
    const { params } = this.state;
    return (
      <Loadding show={this.state.loading}>
        <Row className="futures">
          <Row className="spread-search">
            {/* <Row className="spread-subSearch">
              <Row>{intl.formatMessage({ id: "Contract" })}</Row>
              <Input
                placeholder={intl.formatMessage({ id: "Please_Enter" })}
                value={params.searchParams.contract}
                onChange={this.marketChange}
              />
            </Row> */}
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
              emptyText: TableNoData(intl.formatMessage({ id: "No_Data" }))
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FuturesHistory));
