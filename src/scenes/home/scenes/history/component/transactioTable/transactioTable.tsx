import React, { Component } from "react";
import { connect } from "react-redux";
import empty from "assets/image/empty-table.png";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
import "./transactioTable.scss";
import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { Select, Button, DatePicker, Table, message } from "antd";
import {
  allCoin,
  getAllCoin,
  getTransactionHistories,
  transactionTypes
} from "service/http/http";
import { Loadding } from "components/loadding";
import { messageError, toUtc, guid } from "utils";
import moment from "moment";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { comparedDate, switchValue } from "../exportHistory/data";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface IState {
  loadding: number;
  datas: any;
  total: number;
  pageIndex: number;
  pageSize: number;
  index: number | undefined;
  date: any;
  status: string[];
  instruments: string[];
  coinOptions: [];
  optins: [];
}
interface IProps {
  initDate: (e: string[]) => void;
  initCoin: (e: string[]) => void;
  initStatus: (e: string[]) => void;
}
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps>;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IWithdrawTablePropsState &
  WrappedComponentProps;
class TransactioTable extends Component<IWithdrawTableDispatchState, IState> {
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
      status: [],
      instruments: [],
      coinOptions: [],
      optins: []
    };
  }
  unFold = (index: number) => {
    this.state.index === index
      ? this.setState({ index: undefined })
      : this.setState({ index });
  };
  getTransfersHistories = () => {
    this.setState({
      loadding: 1
    });

    const types = JSON.parse(JSON.stringify(this.state.status));
    if (types.filter((i: any) => i === "WITHDRAW").length > 0) {
      types.push("WITHDRAWAL_REQUEST");
      types.push("WITHDRAWAL");
    }

    getTransactionHistories({
      pageNum: this.state.pageIndex + 1,
      pageSize: this.state.pageSize,
      searchParams: {
        contract: this.state.instruments,
        type: types,
        startDate: this.state.date.length
          ? toUtc(this.state.date[0])
          : undefined,
        endDate: this.state.date.length
          ? toUtc(moment(this.state.date[1]).add(1, "day"))
          : undefined
      }
    }).then((res) => {
      this.setState({
        loadding: 0
      });
      if (res.code === "0000") {
        this.setState({
          datas: res.data.data,
          total: res.data.total
        });
      } else {
        message.warning(res.message);
      }
    });
  };
  getTransactionTypes = () => {
    transactionTypes().then((res) => {
      if (res.code === "0000") {
        let arr = JSON.parse(
          JSON.stringify(res.data).replace("TRADE_FEE", "TRADEFEE")
        );
        arr = JSON.parse(
          JSON.stringify(arr).replace("Withdrawal Request", "Withdraw")
        );
        arr = JSON.parse(JSON.stringify(arr).replace("Withdrawal", "Withdraw"));
        this.setState({
          optins: arr
        });
      }
    });
  };
  getCoins = () => {
    getAllCoin().then((res) => {
      if (res.success) {
        this.setState({ coinOptions: res.data });
      } else {
        message.warning(res.message);
      }
    });
  };
  disableDate = (current: any) => {
    return current && current > moment().endOf("day");
  };
  componentDidMount() {
    this.getTransactionTypes();
    this.getCoins();
    this.getTransfersHistories();
  }
  onChange = (e: any, dateString: any) => {
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
  onRest = () => {
    this.setState(
      {
        status: [],
        instruments: [],
        date: switchValue("1w")
      },
      () => {
        this.getTransfersHistories();
      }
    );
  };
  render() {
    const { intl } = this.props;
    const columns = [
      {
        title: intl.formatMessage({ id: "Coin" }),
        dataIndex: "contract",
        key: "contract",
        render: (_item: any, _record: any, index: number) => (
          <div>{_item}</div>
        )
      },
      {
        title: intl.formatMessage({ id: "Type" }),
        dataIndex: "type",
        key: "type",
        render: (item: any) => (
          <div className="table-status">
            {/* {Object.keys(this.state.optins).map(
              (res: any) =>
                res === item &&
                this.props.intl.formatMessage({
                  id: res,
                  defaultMessage: this.state.optins[res],
                })
            )} */}
            {this.state.optins[item]}
          </div>
        )
      },
      {
        title: intl.formatMessage({ id: "Amount" }),
        dataIndex: "amount",
        key: "amount",
        render: (item: any) => (item !== "0" ? item : "0")
      },
      {
        title: intl.formatMessage({ id: "Date" }),
        key: "date",
        dataIndex: "date",
        render: (item: any) => (
          <div className="table-status">
            {moment.parseZone(item).local().format("YYYY-MM-DD HH:mm:ss")}
          </div>
        )
      }
    ];

    const onShowSizeChange = (current: number, size: number) => {
      this.setState(
        {
          pageSize: size,
          pageIndex: current - 1
        },
        () => {
          this.getTransfersHistories();
        }
      );
    };
    const onChangePagination = (page: number, pageSize: number | undefined) => {
      this.setState(
        {
          pageSize: pageSize!,
          pageIndex: page - 1
        },
        () => {
          this.getTransfersHistories();
        }
      );
    };

    return (
      <Loadding show={this.state.loadding}>
        <div className="transfer-table">
          <div className="transfer-top">
            <div className="coin">
              <div className="intput-name">
                {intl.formatMessage({ id: "Coin" })}
              </div>
              <Select
                mode="multiple"
                maxTagCount={1}
                maxTagTextLength={10}
                style={{ width: "100%" }}
                getPopupContainer={(triggerNode) => triggerNode}
                placeholder={intl.formatMessage({ id: "Please_select" })}
                className="status-select"
                value={this.state.instruments}
                onChange={(e: any) => {
                  this.setState({
                    instruments: e
                  });
                  this.props.initCoin(e);
                }}
              >
                {this.state.coinOptions.map((res) => (
                  <Option key={res} value={res}>
                    {res}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="type">
              <div className="intput-name">
                {intl.formatMessage({ id: "Type" })}
              </div>
              <Select
                mode="multiple"
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
                {Object.keys(this.state.optins)
                  .filter(
                    (i) => i !== "WITHDRAWAL_REQUEST" && i !== "WITHDRAWAL"
                  )
                  .map((res: any) => (
                    <Option key={res} value={res}>
                      {this.props.intl.formatMessage({
                        id: res,
                        defaultMessage: this.state.optins[res]
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
                onChange={this.onChange}
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
                      this.getTransfersHistories();
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
            scroll={{ x: true }}
            rowKey={(recond: any) => guid()}
            pagination={{
              hideOnSinglePage: false,
              pageSizeOptions: ["10", "20", "30"],
              defaultPageSize: 10,
              onShowSizeChange,
              showSizeChanger: true,
              current: this.state.pageIndex + 1,
              total: this.state.total,
              onChange: onChangePagination,
              size: "small",
              itemRender: this.itemRender
            }}
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
)(injectIntl(TransactioTable));
