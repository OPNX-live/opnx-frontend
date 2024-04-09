import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, Table, message, Badge } from "antd";
import { prev, next, SpotHistoryState, SpotState, ISpotProps } from "./type";
import { PrevDay, comparedDate, guid } from "utils/utils";
import "./index.scss";
import moment from "moment";
import empty from "assets/image/empty-table.png";
import { messageError } from "utils";
import { Loadding } from "components/loadding";
import { referralList } from "service/http/http";
import { FormattedMessage } from "react-intl";
const { Option } = Select;
type ISpotHistoryPropsState = ReturnType<typeof mapStateToProps> & ISpotProps;
type ISpotHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;

class ReferralRecord extends Component<ISpotHistoryPropsState, SpotState> {
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
        date: time,
      },
      () => {
        this.props.isLogin && this.referralList();
      }
    );
    this.setState({ loading: 0 });
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
  // handleChange = (e: string[]) => {
  //   this.setState(
  //     {
  //       Market: e,
  //     }
  //   );
  // };
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
      () => {}
    );
  };
  onShowSizeChange = (page: number, pageSize: number) => {
    this.setState(
      {
        pageNum: page,
        pageSize: pageSize!,
      },
      () => {}
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
      () => {}
    );
  };
  referralList = () => {
    this.setState({ loading: 1 });
    referralList({
      status: this.state.status, // Valid 或者 Invalid
    }).then((res: any) => {
      this.setState({ loading: 0 });
      this.setState({
        datas: res.data,
        total: res.data.lenght,
      });
    });
  };
  onChageStatus = (value: any, option: any) => {
    this.setState(
      {
        status: value,
      },
      () => {
        this.referralList();
      }
    );
  };
  render() {
    const columns = [
      {
        title: (
          <FormattedMessage
            id="InvitedAccount"
            defaultMessage="Referral Account"
          />
        ),
        dataIndex: "invitedAccountId",
        key: "invitedAccountId",
        // render: (item: string) =>
        //   item ? item.replace(/(.{3}).*(.{2})/, '$1****$2') : '--',
      },
      {
        title: (
          <FormattedMessage id="RegisterTime" defaultMessage="Register Date" />
        ),
        dataIndex: "registeredTime",
        key: "registeredTime",
        render: (item: string) => (
          <span>{moment(item).format("YYYY-MM-DD HH:mm:ss")}</span>
        ),
      },
      {
        title: (
          <div className="table-status">
            <FormattedMessage id="Status" defaultMessage="Status" />
            <Select
              optionFilterProp="children"
              onChange={this.onChageStatus}
              defaultValue=""
              // getPopupContainer={(node) => node}
            >
              <Option value="">
                <FormattedMessage id="ALL" defaultMessage="All" />
              </Option>
              <Option value="Valid">
                <FormattedMessage id="Valid" defaultMessage="Valid" />
              </Option>
              <Option value="Invalid">
                <FormattedMessage id="Invalid" defaultMessage="Invalid" />
              </Option>
            </Select>
          </div>
        ),
        dataIndex: "status",
        key: "status",
        render: (item: string) => (
          <div>
            <Badge status={item === "Valid" ? "success" : "default"} />
            {<FormattedMessage id={item} defaultMessage={item} />}
          </div>
        ),
      },
    ];
    const { datas, loading } = this.state;
    return (
      <Loadding show={loading}>
        <div className="referral-record">
          {/* <div className="referral-record-top">
            <div className="date">
              <RangePicker
                format={'YYYY-MM-DD'}
                suffixIcon={<Date />}
                onChange={this.onPanelChange}
                separator=" ~ "
                disabledDate={(current) =>
                  current && current > moment().endOf('day')
                }
                allowClear={false}
                value={
                  date && [
                    moment(date[0], 'YYYY-MM-DD'),
                    moment(date[1], 'YYYY-MM-DD'),
                  ]
                }
                className="date-picker"
              />
            </div>
            <div className="spot-search">
              <Button type="text">Search</Button>
            </div>
            <div className="spot-btn">
              <Button type="text" onClick={this.spotRest}>
                Reset
              </Button>
            </div>
          </div> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(ReferralRecord);
