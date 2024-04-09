import React, { Component } from "react";
import { connect } from "react-redux";
import { DatePicker, Table, Button, message } from "antd";
import {
  prev,
  next,
  Date,
  SpotHistoryState,
  SpotState,
  ISpotProps,
} from "./type";
import {
  PrevDay,
  comparedDate,
  guid,
  toUtc,
  getMonthStartOrEnd,
} from "utils/utils";
import "./index.scss";
import moment from "moment";
import empty from "assets/image/empty-table.png";
import { messageError } from "utils";
import { Loadding } from "components/loadding";
import { rebates } from "service/http/http";
import { FormattedMessage } from "react-intl";
const { RangePicker } = DatePicker;
type ISpotHistoryPropsState = ReturnType<typeof mapStateToProps> & ISpotProps;
type ISpotHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
const columns = [
  {
    title: <FormattedMessage id="Commission" defaultMessage="Commission" />,
    dataIndex: "houseProfit",
    key: "houseProfit",
    render: (item: string, row: any) => (
      <span>
        {item} {row.instrument} OX
      </span>
    ),
  },
  {
    title: <FormattedMessage id="Time" defaultMessage="Time" />,
    dataIndex: "createdDate",
    key: "createdDate",
    render: (item: string) => (
      <span>{moment(item).format("YYYY-MM-DD HH:mm:ss")}</span>
    ),
  },
  {
    title: (
      <FormattedMessage id="FromAccount" defaultMessage="Referral Account" />
    ),
    dataIndex: "recoEmail",
    key: "recoEmail",
    render: (item: string) =>
      item ? item.replace(/(.{3}).*(.{2})/, "$1****$2") : "--",
  },
];
class RebatesRecord extends Component<ISpotHistoryPropsState, SpotState> {
  constructor(props: any) {
    super(props);
    this.state = SpotHistoryState;
  }
  componentDidUpdate(prevProps: ISpotProps, nextState: any) {}
  async componentDidMount() {
    const time = [getMonthStartOrEnd().firstDay, getMonthStartOrEnd().lastDay];
    this.setState(
      {
        date: time,
      },
      () => {
        this.props.isLogin && this.rebates();
      }
    );
  }
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
  handleChange = (type: string, e: string[]) => {};
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
        date: time,
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
        this.rebates();
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
        this.rebates();
      }
    );
  };
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
        pageNum: 1,
        pageSize: 10,
        date: time,
        status: "",
      },
      () => {
        this.rebates();
      }
    );
  };
  rebates = () => {
    if (this.props.isLogin) {
      this.setState({ loading: true });
      const { pageNum, pageSize, date } = this.state;
      rebates({
        pageNum,
        pageSize,
        searchParams: {
          startDate: toUtc(date[0]),
          endDate: moment(toUtc(date[1]))
            .add(1, "day")
            .format("YYYY-MM-DD HH:mm:ss"),
          dataEntry: "FUTURE",
        },
      }).then((res) => {
        this.setState({ loading: false });
        if (res.code === "0000") {
          this.setState({
            datas: res.data.data,
            total: res.data.total,
          });
        }
      });
    } else {
      message.warning(messageError("05004"));
    }
  };
  render() {
    const { date, datas, loading } = this.state;
    return (
      <Loadding show={loading ? 1 : 0}>
        <div className="rebates-record">
          <div className="rebates-record-top">
            <div className="date">
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
                  date && [
                    moment(date[0], "YYYY-MM-DD"),
                    moment(date[1], "YYYY-MM-DD"),
                  ]
                }
                className="date-picker"
              />
            </div>
            <div className="spot-search">
              <Button type="text" onClick={this.rebates}>
                <FormattedMessage id="Search" defaultMessage="Search" />
              </Button>
            </div>
            <div className="spot-btn">
              <Button type="text" onClick={this.spotRest}>
                <FormattedMessage id="Reset" defaultMessage="Reset" />
              </Button>
            </div>
          </div>
          <Table
            className="ant_table"
            columns={columns}
            dataSource={datas}
            rowKey={(recond) => guid()}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={empty} alt="empty-table" />
                  <span style={{ marginTop: "12px" }}>
                    <FormattedMessage
                      id="NoRecordsYet"
                      defaultMessage="No records yet"
                    />
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
const mapStateToProps = (state: IGlobalT) => {
  return {
    isLogin: state.isLogin,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(RebatesRecord);
