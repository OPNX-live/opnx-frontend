import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, message } from "antd";
import empty from "assets/image/empty-table.png";
import { SevenHistory } from "service/http/http";
import { convertFont } from "./type";
import { messageError, toThousands } from "utils";
import { PrevDay } from "scenes/home/scenes/history/component/exportHistory/data";
import moment from "moment";
import "./DepositTable.scss";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";

const space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

type IDepositTableState = {
  index: number | undefined;
  historyData: IDepositTableResponse[] | [];
};
type DepositTableProps = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
export class DepositTable extends Component<
  DepositTableProps,
  IDepositTableState
> {
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
      title: <FormattedMessage id="Amount" />,
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
                href={_record.txUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                {_record.txId}
              </a>
            </div>
          ) : null}
        </div>
      ),
    },
  ];
  constructor(props: DepositTableProps) {
    super(props);
    this.state = {
      index: undefined,
      historyData: [],
    };
  }
  componentDidMount() {
    this.getDepositTableData();
  }
  getDepositTableData = async () => {
    // debugger;
    const [endDate, startDate] = PrevDay(1, "weeks");
    const res = await SevenHistory(
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
  openHref = (url: string, e: any) => {
    e.stopPropagation();
    window.open(url);
  };
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  render() {
    const { historyData } = this.state;
    return (
      <div className="depositTable">
        <Table
          columns={this.columns}
          dataSource={historyData}
          rowKey={(record) => record.txIdUrl}
          scroll={{ x: true }}
          pagination={false}
          locale={{
            emptyText: (
              <div className="recentHistory-empty-table">
                <img src={empty} alt="empty-table" />
                <p className="recentHistory-empty-table-span">
                  <FormattedMessage
                    id="Recent_History"
                    values={{ type: <FormattedMessage id="Deposit" /> }}
                  />
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

const mapStateToProps = (state: IGlobalT) => ({
  dashboardUserData: state.dashboardUserData,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DepositTable));
