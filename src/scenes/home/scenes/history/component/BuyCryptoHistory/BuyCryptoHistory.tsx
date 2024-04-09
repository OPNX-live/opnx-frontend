import React, { Component } from "react";
import { connect } from "react-redux";
import empty from "assets/image/empty-table.png";
import { ReactComponent as Date } from "assets/image/date-lint.svg";

import { Select, Button, DatePicker, Table, message } from "antd";
import { moonpayHistory } from "service/http/http";
import { Loadding } from "components/loadding";
import { messageError, toUtcNumber, guid, DecimalNum, toCoinAccuracy } from "utils";
import moment from "moment";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { comparedDate, switchValue } from "../exportHistory/data";
import { IBuyCryptoData } from "./type";
// import prev from "../../../../../../assets/image/pagination-left.svg";
// import next from "../../../../../../assets/image/pagination-right.svg";
import _ from "lodash";
import "./BuyCryptoHistory.scss";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface IState {
  loadding: number;
  datas: IBuyCryptoData[];
  total: number;
  pageIndex: number;
  pageSize: number;
  index: number | undefined;
  date: any;
  status: string;
  instruments: string[];
  coinOptions: [];
}
interface IProps {
  initDate: (e: string[]) => void;
  initCoin: (e: string[]) => void;
  initStatus: (e: string[]) => void;
}
interface IStatus {
  value: string;
  text: string;
}
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps>;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawTablePropsState &
  WrappedComponentProps;
const statusSearch: IStatus[] = [
  { value: "All", text: "All" },
  { value: "waiting Payment", text: "Waiting Payment" },
  { value: "pending", text: "Pending" },
  { value: "waiting Authorization", text: "Waiting Authorization" },
  { value: "failed", text: "Failed" },
  { value: "completed", text: "Completed" }
];
class BuyCryptoHistory extends Component<IWithdrawTableDispatchState, IState> {
  constructor(props: IWithdrawTableDispatchState) {
    super(props);
    this.state = {
      loadding: 0,
      datas: [],
      total: 0,
      pageIndex: 0,
      pageSize: 10,
      index: undefined,
      date: switchValue("1w"),
      status: "All",
      instruments: [],
      coinOptions: []
    };
  }
  unFold = (index: number) => {
    this.state.index === index
      ? this.setState({ index: undefined })
      : this.setState({ index });
  };
  getBuyCryptoHistories = () => {
    const { date, status } = this.state;
    this.setState({
      loadding: 1
    });
    moonpayHistory(
      status === "All" ? "" : status,
      toUtcNumber(date[0]),
      toUtcNumber(moment(date[1]).add(1, "day"))
    ).then((res) => {
      this.setState({
        loadding: 0
      });
      if (res.success) {
        this.setState({ datas: res.data });
      } else {
        message.warning(res.message);
      }
    });
  };
  disableDate = (current: any) => {
    return current && current > moment().endOf("day");
  };
  // itemRender = (
  //   current: number,
  //   type: string,
  //   originalElement: React.ReactNode
  // ) => {
  //   if (type === "prev") {
  //     return <img alt="prev" src={prev} />;
  //   }
  //   if (type === "next") {
  //     return <img alt="next" src={next} />;
  //   }
  //   return originalElement;
  // };
  componentDidMount() {
    this.getBuyCryptoHistories();
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
        status: "All",
        date: switchValue("1w")
      },
      () => {
        this.getBuyCryptoHistories();
      }
    );
  };
  spaend = (areFeesIncluded: boolean, _index: IBuyCryptoData) => {
    if (areFeesIncluded) {
      return _index.baseCurrencyAmount;
    }
    return (
      Number(_index.baseCurrencyAmount) +
      Number(_index.feeAmount) +
      Number(_index.extraFeeAmount) +
      Number(_index.networkFeeAmount)
    ).toFixed(2);
  };
  render() {
    const { intl } = this.props;
    const columns = [
      {
        title: "Currency",
        dataIndex: "currency",
        key: "baseCurrency",
        render: (item: string) => <div>{item}</div>
      },
      {
        title: "Spend",
        dataIndex: "areFeesIncluded",
        key: "areFeesIncluded",
        render: (item: boolean, _index: IBuyCryptoData) => {
          return (
            <div>
              {this.spaend(item, _index)} {_index.baseCurrency}
            </div>
          );
        }
      },
      {
        title: "Proceeds",
        dataIndex: "quoteCurrencyAmount",
        key: "quoteCurrencyAmount",
        render: (item: string, _index: IBuyCryptoData) => {
          return (
            <div>
              {item} {_index.currency}
            </div>
          );
        }
      },
      // {
      //   title: intl.formatMessage({ id: "Price" }),
      //   dataIndex: "quoteCurrencyAmount",
      //   key: "Price",
      //   render: (item: string, _index: IBuyCryptoData) => (
      //     <div>
      //       {toCoinAccuracy(DecimalNum(
      //         Number(_index.baseCurrencyAmount) -(
      //           Number(_index.feeAmount) +
      //           Number( _index.extraFeeAmount)),
      //        Number(_index.quoteCurrencyAmount) + Number(_index.networkFeeAmount),
      //         "div"
      //       ),2)}{" "}
      //       {_index.currency + "/" + _index.baseCurrency}
      //     </div>
      //   )
      // },
      {
        title: "Processing fee",
        dataIndex: "feeAmount",
        key: "feeAmount",
        render: (item: string, _index: IBuyCryptoData) => {
          return (
            <div>
              {(Number(item) + Number(_index.extraFeeAmount)).toFixed(2)} {_index.baseCurrency}
            </div>
          );
        }
      },
      {
        title: "Network fee",
        dataIndex: "networkFeeAmount",
        key: "networkFeeAmount",
        render: (item: string, _index: IBuyCryptoData) => {
          return (
            <div>
              {item} {_index.baseCurrency}
            </div>
          );
        }
      },
      {
        title: intl.formatMessage({ id: "Date" }),
        dataIndex: "created",
        key: "created",
        render: (item: number) => (
          <div style={{ whiteSpace: "nowrap" }}>
            {moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )
      },
      {
        title: intl.formatMessage({ id: "Status" }),
        key: "status",
        dataIndex: "status",
        render: (item: string) => <div className="table-status">{item}</div>
      }
    ];

    // const onShowSizeChange = (current: number, size: number) => {
    //   this.setState(
    //     {
    //       pageSize: size,
    //       pageIndex: current - 1
    //     },
    //     () => {
    //       this.getBuyCryptoHistories();
    //     }
    //   );
    // };
    // const onChangePagination = (page: number, pageSize: number | undefined) => {
    //   this.setState(
    //     {
    //       pageSize: pageSize!,
    //       pageIndex: page - 1
    //     },
    //     () => {
    //       this.getBuyCryptoHistories();
    //     }
    //   );
    // };

    return (
      <Loadding show={this.state.loadding}>
        <div className="buy_crypto_table">
          <div className="buy_crypto_top">
            <div className="status">
              <div className="intput-name">
                {intl.formatMessage({ id: "Status" })}
              </div>
              <Select
                // mode="multiple"
                maxTagCount={1}
                maxTagTextLength={10}
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({ id: "Please_select" })}
                className="status-select"
                value={this.state.status}
                onChange={(e: any) => {
                  this.setState({
                    status: e
                  });
                  this.props.initStatus(e);
                }}
              >
                {statusSearch.map((res) => (
                  <Option key={res.text} value={res.value}>
                    {this.props.intl.formatMessage({
                      id: res.text,
                      defaultMessage: res.text
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
                }}
                suffixIcon={<Date />}
              />
            </div>

            <div className="spot-search">
              <Button
                type="text"
                onClick={() => {
                  this.setState(
                    {
                      pageIndex: 0
                    },
                    () => {
                      this.getBuyCryptoHistories();
                    }
                  );
                }}
              >
                {intl.formatMessage({ id: "Search" })}
              </Button>
            </div>
            <div className="spot-btn">
              <Button type="text" onClick={this.onRest}>
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
            // pagination={{
            //   pageSizeOptions: ["10", "20", "30"],
            //   defaultPageSize: 10,
            //   onShowSizeChange,
            //   showSizeChanger: true,
            //   current: this.state.pageIndex + 1,
            //   total: this.state.total,
            //   onChange: onChangePagination,
            //   size: "small",
            //   itemRender: this.itemRender
            // }}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BuyCryptoHistory));
