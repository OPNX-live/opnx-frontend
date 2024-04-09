import React, { Component } from "react";
import { connect } from "react-redux";
import empty from "assets/image/empty-table.png";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
import "./Reward.scss";

import { Select, Button, DatePicker, Table, message } from "antd";
import { getRewards, getReceive } from "service/http/http";
import { Loadding } from "components/loadding";
import { messageError, toUtcNumber, guid } from "utils";
import moment from "moment";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";
import { toLocaleString } from "utils/toLocaleString";
import _ from "lodash";
import {
  switchValue,
  comparedDate
} from "scenes/home/scenes/history/component/exportHistory/data";
const { Option } = Select;
const { RangePicker } = DatePicker;

interface IState {
  loadding: number;
  datas: any;
  date: any;
  status: string;
  type: string;
  disabled: { [key: string]: boolean };
}

interface IProps {
  initDate: (e: string[]) => void;
}
type IRewardPropsState = ReturnType<typeof mapStateToProps>;
type IRewardDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IRewardPropsState &
  WrappedComponentProps;

class Reward extends Component<IRewardDispatchState, IState> {
  constructor(props: IRewardDispatchState) {
    super(props);
    this.state = {
      loadding: 0,
      datas: [],
      date: switchValue("1w"),
      status: "",
      type: "",
      disabled: {}
    };
  }
  // unFold = (index: number) => {
  //   this.state.index === index
  //     ? this.setState({ index: undefined })
  //     : this.setState({ index });
  // };
  getReward = async () => {
    this.setState({
      loadding: 1
    });
    const res = await getRewards({
      type: this.state.type,
      status: this.state.status, //  COMPLETED,PENDING, FAILED
      startTime: this.state.date.length
        ? toUtcNumber(this.state.date[0])
        : undefined,
      endTime: this.state.date.length
        ? toUtcNumber(moment(this.state.date[1]).add(1, "day"))
        : undefined
    });

    if (res.code === "0000") {
      this.setState({
        datas: res.data
      });
    } else {
      message.warning(res.message);
    }
    this.setState({
      loadding: 0
    });
  };

  // getCoins = () => {
  //   allCoin(this.props.dashboardUserData.tradingType).then((res) => {
  //     if (res.success) {
  //       this.setState({ coinOptions: res.data });
  //     } else {
  //       message.warning(res.message);
  //     }
  //   });
  // };

  disableDate = (current: any) => {
    return current && current > moment().endOf("day");
  };

  componentDidMount() {
    this.getReward();
  }

  onChange = (dateString: any) => {
    if (comparedDate(dateString)) {
      this.setState({
        date: dateString
      });
      this.props.initDate(dateString);
    } else {
      this.setState({
        date: [dateString[0], moment(dateString[0]).add(3, "M")]
      });
      message.error(messageError("31002"));
    }
  };
  onRest = () => {
    this.setState(
      {
        status: "",
        date: switchValue("1w"),
        type: ""
      },
      () => {
        this.getReward();
      }
    );
  };
  onReceive = async (id: string) => {
    // this.setState({disabled:{...this.state.disabled,[id.toString()]:true}})
    this.setState({ loadding: 1 });
    const res = await getReceive(id);
    if (res.success) {
      await this.getReward();
    } else {
      message.error(res.message);
    }
    this.setState({ loadding: 0 });
  };
  render() {
    const { intl } = this.props;

    const typeOptins = [
      {
        lable: this.props.intl.formatMessage({
          id: "ARENA_REWARD",
          defaultMessage: "ARENA_REWARD"
        }),
        value: "ARENA_REWARD"
      },
      {
        lable: this.props.intl.formatMessage({
          id: "MISSION_REWARD",
          defaultMessage: "MISSION_REWARD"
        }),
        value: "MISSION_REWARD"
      }
    ];
    const optins = [
      {
        lable: this.props.intl.formatMessage({
          id: "Completed",
          defaultMessage: "Completed"
        }),
        value: "COMPLETED"
      },
      {
        lable: this.props.intl.formatMessage({
          id: "Pending",
          defaultMessage: "Pending"
        }),
        value: "PENDING"
      }
    ];
    const columns = [
      {
        title: intl.formatMessage({ id: "Coin" }),
        dataIndex: "rewardCoin",
        key: "rewardCoin",
        render: (_item: any, _record: any, index: number) => (
          <div>{_item}</div>
        )
      },
      {
        title: intl.formatMessage({ id: "Amount" }),
        dataIndex: "rewardAmount",
        key: "rewardAmount",
        render: (item: any) => (item !== 0 ? toLocaleString(item) : "0")
      },

      {
        title: intl.formatMessage({ id: "Type", defaultMessage: "Type" }),
        key: "type",
        dataIndex: "type" 
      },
      {
        title: intl.formatMessage({ id: "Date" }),
        key: "created",
        dataIndex: "created",
        render: (item: any) => (
          <div className="table-status">
            {moment.utc(item).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )
      },
      {
        title: intl.formatMessage({ id: "Status" }),
        dataIndex: "status",
        key: "status",
        render: (item: any) => (
          <FormattedMessage
            id={_.upperFirst(_.toLower(item))}
            defaultMessage={_.upperFirst(_.toLower(item))}
          />
        )
      },
      {
        title: intl.formatMessage({ id: "Action", defaultMessage: "Action" }),
        dataIndex: "status",
        key: "action",
        render: (item: any, data: any) => (
          <div className="table-action">
            {item === "PENDING" && (
              <Button
                type="primary"
                style={{ fontSize: 12 }}
                onClick={() => {
                  this.onReceive(data.rewardId);
                }}
                disabled={this.state.disabled?.[data.rewardId]}
              >
                {intl.formatMessage({
                  id: "RECEIVE",
                  defaultMessage: "RECEIVE"
                })}
              </Button>
            )}
          </div>
        )
      }
    ];

    return (
      <Loadding show={this.state.loadding}>
        <div className="reward-table">
          <div className="reward-top">
            <div className="status" style={{ marginRight: 12 }}>
              <div className="intput-name">
                {intl.formatMessage({ id: "Type", defaultMessage: "Type" })}
              </div>
              <Select
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({ id: "Please_select" })}
                className="status-select"
                value={this.state.type}
                onChange={(e: any) => {
                  this.setState({
                    type: e
                  });
                }}
              >
                {typeOptins.map((res) => (
                  <Option key={res.value} value={res.value}>
                    {this.props.intl.formatMessage({
                      id: res.value,
                      defaultMessage: res.lable
                    })}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="status">
              <div className="intput-name">
                {intl.formatMessage({ id: "Status" })}
              </div>
              <Select
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({ id: "Please_select" })}
                className="status-select"
                value={this.state.status}
                onChange={(e: any) => {
                  this.setState({
                    status: e
                  });
                }}
              >
                {optins.map((res) => (
                  <Option key={res.value} value={res.value}>
                    {this.props.intl.formatMessage({
                      id: res.value,
                      defaultMessage: res.lable
                    })}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="date">
              <div className="intput-name">
                {intl.formatMessage({ id: "Date" })}
              </div>
              <RangePicker
                // defaultValue={this.state.date}
                disabledDate={this.disableDate}
                separator=" ~ "
                className="date-picker"
                value={
                  this.state.date && [
                    moment(this.state.date[0], "YYYY-MM-DD"),
                    moment(this.state.date[1], "YYYY-MM-DD")
                  ]
                }
                allowClear={false}
                onChange={(e: any, s) => {
                  this.onChange(s);
                  // this.setState({
                  //   date: s,
                  // });
                }}
                suffixIcon={<Date />}
              />
            </div>

            <div className="spot-search">
              <Button
                type="primary"
                onClick={() => {
                  this.getReward();
                }}
              >
                {intl.formatMessage({ id: "Search" })}
              </Button>
            </div>
            <div className="spot-btn">
              <Button type="primary" onClick={this.onRest}>
                {intl.formatMessage({ id: "Reset" })}
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={this.state.datas}
            rowClassName={(record, index) => "table-row"}
            rowKey={(recond: any) => guid()}
            scroll={{ x: true }}
            pagination={false}
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
          />
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Reward));
