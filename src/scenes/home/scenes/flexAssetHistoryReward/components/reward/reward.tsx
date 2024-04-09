import React, { PureComponent } from "react";
import { connect } from "react-redux";
import {
  IRewardStates,
  prev,
  next,
  Date,
  IRewardPropsInput,
  IRewardOutput,
  IRewardParams
} from "./type";
import "./reward.scss";
import exportImg from "assets/image/export.svg";
import ExportHistory from "../../../flexAssetHistory/components/exportHistory/ExportHistory";
import { Row, DatePicker, Button, Table, message } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { PrevDay, comparedDate, messageError, guid } from "utils";
import { getFlexAssetHisory } from "service/http/http";
import { TableNoData } from "components/publicComponent/publicComponent";
import { Loadding } from "components/loadding";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { switchValue } from "../../../flexAssetHistory/components/exportHistory/data";
const { RangePicker } = DatePicker;
type IRewardPropsState = ReturnType<typeof mapStateToProps>;
type IRewardDispatchState = ReturnType<typeof mapDispatchToProps>;

type IRewardProps = IRewardPropsState &
  IRewardDispatchState &
  IRewardPropsInput;
class RewardHistort extends PureComponent<
  IRewardProps & WrappedComponentProps,
  IRewardStates
> {
  static getDerivedStateFromProps(
    nextProps: IRewardProps,
    nextState: IRewardStates
  ) {
    // if (nextProps.markets !== nextState.markets) {
    //   return {
    //     markets: nextProps.markets,
    //   };
    // }
    return null;
  }
  readonly state: IRewardStates = {
    visible: false,
    initDate: switchValue("1w"),
    loading: 0,
    markets: [],
    result: {
      data: [[]],
      total: 0
    },
    params: {
      pageNum: 1,
      pageSize: 10,
      searchParams: {
        historyType: "REWARD",
        startDate: PrevDay(1, "weeks")[0],
        endDate: PrevDay(1, "weeks")[1],
        accountId: this.props.dashboardUserData.accountId
      }
    }
  };
  columns: ColumnsType<IRewardOutput> = [
    {
      title: this.props.intl.formatMessage({ id: "Time" }),
      dataIndex: "createdTime",
      key: "createdTime",
      render: (item: string) => (
        <span>
          {moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss")}
        </span>
      )
    },
    {
      title: this.props.intl.formatMessage({ id: "Account_Name" }),
      dataIndex: "account",
      key: "account",
      render: (item: string) =>
        this.props.dashboardUserData.accountId === item
          ? this.props.dashboardUserData.accountName
          : item
    },
    {
      title: this.props.intl.formatMessage({ id: "Reward" }),
      key: "reward",
      dataIndex: "reward"
    },
    {
      title: this.props.intl.formatMessage({ id: "Average_APR" }),
      dataIndex: "averageApr",
      key: "averageApr",
      render: (item: string) => `${item}%`
    }
  ];
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: any) {
    super(props);
  }

  componentDidUpdate(nextProps: IRewardProps, nextState: IRewardStates) {
    // if (nextProps.markets !== this.props.markets) {
    //   this.setState(
    //     {
    //       markets: this.props.markets,
    //     },
    //     () => {
    //       this.getResult();
    //     }
    //   );
    // }
    // if (nextState.params.searchParams !== this.state.params.searchParams) {
    //   this.props.exportsBack(this.state.params.searchParams);
    // }
  }
  async getResult() {
    this.setState({ loading: 1 });
    const param: IRewardParams = JSON.parse(JSON.stringify(this.state.params));
    param.searchParams.startDate = moment(param.searchParams.startDate)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    param.searchParams.endDate = moment(param.searchParams.endDate)
      .utc()
      .add(1, "day")
      .format("YYYY-MM-DD HH:mm:ss");

    const result = await getFlexAssetHisory(param);
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
            historyType: "REWARD"
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
            historyType: "REWARD",
            startDate: PrevDay(1, "weeks")[0],
            endDate: PrevDay(1, "weeks")[1],
            accountId: this.props.dashboardUserData.accountId
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
    // this.props.exportsBack(this.state.params.searchParams);
  }

  render() {
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loading}>
        <Row className="reward">
          <Row className="reward-search">
            <Row className="reward-subSearch">
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
                            endDate: moment(last).format("YYYY-MM-DD HH:mm:ss")
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
            <Row className="reward-subSearch">
              <div className="btns">
                <Button type="primary" onClick={this.getResult.bind(this)}>
                  {intl.formatMessage({ id: "Search" })}
                </Button>
                <Button type="text" onClick={this.reset.bind(this)}>
                  {intl.formatMessage({ id: "Reset" })}
                </Button>
              </div>
            </Row>
            <Row className="reward-subSearch reward-export">
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
                      id: this.state.params.searchParams.historyType
                    })
                  }
                )}
                <img src={exportImg} alt="export" />
              </div>
            </Row>
          </Row>
          <Table
            columns={this.columns}
            dataSource={this.state.result.data[0]}
            scroll={{ x: true }}
            locale={{
              emptyText: TableNoData(intl.formatMessage({ id: "No_History" }))
            }}
            rowKey={(record) => guid()}
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
        <ExportHistory
          type={"Reward"}
          coin={[""]}
          initDate={this.state.initDate}
          visible={this.state.visible}
          handlerModale={(visible: boolean) => {
            this.setState({ visible });
          }}
          status={[]}
        />
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
)(injectIntl(RewardHistort));
