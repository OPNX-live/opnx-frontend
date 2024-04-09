import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, message } from "antd";
import empty from "assets/image/empty-table.png";
import { withdrawHistory } from "service/http/http";
import { convertFont } from "./type";
import { messageError, toThousands } from "utils";
import { PrevDay } from "scenes/home/scenes/history/component/exportHistory/data";
import { TooltipGlobal } from "components/TooltipGlobal/Tooltip";
import { setRefresh } from "store/actions/publicAction";
import "./WithdrawTable.scss";
import moment from "moment";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
const space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

type IWithdrawTableState = {
  index: number | undefined;
  historyData: IDepositTableResponse[] | [];
};
type IWithdrawTablePropsState = ReturnType<typeof mapStateToProps>;
type IWithdrawTableDispatchState = ReturnType<typeof mapDispatchToProps>;
type IWithdrawTableProps = IWithdrawTableDispatchState &
  IWithdrawTablePropsState &
  WrappedComponentProps;
export class WithdrawTable extends Component<
  IWithdrawTableProps,
  IWithdrawTableState
> {
  static getDerivedStateFromProps(nextProps: IWithdrawTableProps) {
    if (nextProps.refresh) {
      return { nextProps };
    }
    return null;
  }
  columns = [
    {
      title: <FormattedMessage id="Coin" />,
      dataIndex: "instrument",
      key: "instrument",
      render: (_item: string) => (
        <span>{_item}</span>
      ),
    },
    {
      title: <FormattedMessage id="Status" />,
      dataIndex: "status",
      key: "status",
      render: (_item: string) => (
        <span style={{ color: _item === "FAILED" ? "#d13051" : "" }}>
          {convertFont(_item, this.props.intl)}
        </span>
      ),
    },
    {
      title: <FormattedMessage id="Total_including_Fee" />,
      dataIndex: "amount",
      key: "amount",
      render: (_item: string) => toThousands(_item),
    },
    {
      title: <FormattedMessage id="Date" />,
      key: "createdDate",
      dataIndex: "createdDate",
      render: (_item: string) => (
        <span>
          {moment
            .parseZone(_item, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      title: <FormattedMessage id="Information" />,
      key: "action",
      dataIndex: "action",
      render: (_item: any, _record: any, index: number) => (
        <div
          className={
            this.state.index === index ? "information-top" : "information"
          }
        >
          <p className="information-address">
            <span>
              <FormattedMessage id="Address" />：
            </span>
            {this.props.dashboardUserData.copperAccount
              ? "From Copper account " +
                this.props.dashboardUserData.copperAccount
              : _record.address +
                `${_record.tag ? "(" + _record.tag + ")" : ""}`}
            {_record.walletLabel ? (
              <TooltipGlobal title={_record.walletLabel}>
                <span className="information-txid-accountName">
                  {_record.walletLabel}
                </span>
              </TooltipGlobal>
            ) : null}
          </p>
          <div
            onClick={this.unFold.bind(this, index)}
            className={`information-txid-select${
              this.state.index === index ? "d" : ""
            }`}
          ></div>
          {this.state.index === index ? (
            <div className="information-txid">
              <span dangerouslySetInnerHTML={{ __html: space }}></span>
              <span>Txid：</span>
              <a
                href={_record.txIdUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                {_record.txId}
              </a>
              <div>
                <span dangerouslySetInnerHTML={{ __html: space }}></span>
                <span>
                  <FormattedMessage id="Fee" />：
                </span>
                <p>{_record.fee}</p>
              </div>
            </div>
          ) : null}
        </div>
      ),
    },
  ];
  constructor(props: any) {
    super(props);
    this.state = {
      index: undefined,
      historyData: [],
    };
  }
  componentDidMount() {
    this.getWithdrawData();
  }
  componentDidUpdate() {
    if (this.props.refresh) {
      this.getWithdrawData();
      this.props.setRefresh(false);
    }
  }
  getWithdrawData = async () => {
    const [endDate, startDate] = PrevDay(1, "weeks");
    const res = await withdrawHistory(
      moment(endDate).utc().format("YYYY-MM-DD HH:mm:ss"),
      moment(startDate).add(1, "days").utc().format("YYYY-MM-DD HH:mm:ss")
    );

    if (res.code === "0000") {
      this.setState({ historyData: res.data });
    } else {
      message.error(res.message);
    }
  };
  unFold = (index: number) => {
    this.state.index === index
      ? this.setState({ index: undefined })
      : this.setState({ index });
  };
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const { historyData } = this.state;
    return (
      <div className="withdrawTable">
        <Table
          columns={this.columns}
          dataSource={historyData}
          rowKey={(record) => record.createdDate}
          scroll={{ x: true }}
          pagination={false}
          locale={{
            emptyText: (
              <div className="recentHistory-empty-table">
                <img src={empty} alt="empty-table" />
                <p className="recentHistory-empty-table-span">
                  <FormattedMessage id="Recent_Withdrawal_History" />
                </p>
                <p>
                  ( <FormattedMessage id="One_week" /> )
                </p>
              </div>
            ),
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: { refresh: boolean } & IGlobalT) => {
  return {
    refresh: state.refresh,
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setRefresh(data: boolean) {
      dispatch(setRefresh(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(WithdrawTable));
