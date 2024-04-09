import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, message } from "antd";
import TooltipGlobal from "components/TooltipGlobal/Tooltip";
import empty from "assets/image/empty-table.png";
import { transferHistory } from "service/http/http";
import { messageError, toThousands, tradingType } from "utils";
import { convertFont } from "../depositTable/type";
import { setRefresh } from "store/actions/publicAction";
import { PrevDay } from "scenes/home/scenes/history/component/exportHistory/data";
import "./TransferTable.scss";
import moment from "moment";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";

type ITransferState = {
  Transfer: ITransferTableResponse[] | [];
};
type ITransferTablePropsState = ReturnType<typeof mapStateToProps>;
type ITransferTableDispatchState = ReturnType<typeof mapDispatchToProps>;
type ITransferTableProps = ITransferTablePropsState &
  ITransferTableDispatchState &
  WrappedComponentProps;
export class TransferTable extends Component<
  ITransferTableProps,
  ITransferState
> {
  columns = [
    {
      title: <FormattedMessage id="Coin" />,
      dataIndex: "instrument",
      key: "instrument",
      render: (_item: string) => <span>{_item}</span>,
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
      title: <FormattedMessage id="From" />,
      key: "fromAccountId",
      dataIndex: "fromAccountId",
      render: (_item: any, _record: ITransferTableResponse) => (
        <div className="transferTable-row">
          <TooltipGlobal title={_record.fromAccountName}>
            <span className="transferTable-row-subAccountName">
              {_record.fromAccountName}
            </span>
          </TooltipGlobal>
          {/* <span className="transferTable-row-tradingTye">
            / {tradingType(_record?.fromTradingType)}
          </span> */}
        </div>
      ),
    },
    {
      title: <FormattedMessage id="To" />,
      key: "toAccountId",
      dataIndex: "toAccountId",
      render: (_item: any, _record: ITransferTableResponse) => (
        <div className="transferTable-row">
          <TooltipGlobal title={_record.toAccountName}>
            <span className="transferTable-row-subAccountName">
              {_record.toAccountName}
            </span>
          </TooltipGlobal>
          {/* <span className="transferTable-row-tradingTye">
            / {tradingType(_record?.toTradingType)}
          </span> */}
        </div>
      ),
    },
    {
      title: <FormattedMessage id="Date" />,
      key: "transTimestamp",
      dataIndex: "transTimestamp",
      render: (_item: string) => (
        <span>
          {moment
            .parseZone(_item, "YYYY-MM-DD HH:mm:ss")
            .local()
            .format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
  ];
  constructor(props: ITransferTableProps) {
    super(props);
    this.state = { Transfer: [] };
  }
  componentDidMount() {
    this.getTransferData();
  }
  async getTransferData() {
    const [endDate, startDate] = PrevDay(1, "weeks");
    const res = await transferHistory(
      moment(endDate).utc().format("YYYY-MM-DD HH:mm:ss"),
      moment(startDate).add(1, "days").utc().format("YYYY-MM-DD HH:mm:ss")
    );
    res.code === "0000" && this.setState({ Transfer: res.data });
    res.code !== "0000" && message.error(res.message);
  }
  UNSAFE_componentWillReceiveProps(nextProps: any) {
    if (nextProps.refresh) {
      this.getTransferData();
      this.props.setRefresh(false);
    }
  }
  render() {
    const { Transfer } = this.state;
    return (
      <div className="transferTable">
        <Table
          columns={this.columns}
          dataSource={Transfer}
          pagination={false}
          scroll={{ x: true }}
          rowKey={(_record: any) => _record.accountName}
          locale={{
            emptyText: (
              <div className="recentHistory-empty-table">
                <img src={empty} alt="empty-table" />
                <p className="recentHistory-empty-table-span">
                  <FormattedMessage
                    id="Recent_History"
                    values={{
                      type: <FormattedMessage id="Transfer" />,
                    }}
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

const mapStateToProps = (state: { refresh: boolean }) => {
  return {
    refresh: state.refresh,
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
)(injectIntl(TransferTable));
