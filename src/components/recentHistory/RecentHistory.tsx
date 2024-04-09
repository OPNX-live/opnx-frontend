import React, { Component } from "react";
import { connect } from "react-redux";
import DepositTable from "./depositTable/DepositTable";
import TransferTable from "./transferTable/TransferTable";
import history from "router/history";
import WithdrawTable from "./withdrawTable/WithdrawTable";
import "./RecentHistory.scss";
import { FormattedMessage } from "react-intl";

type IRecentHistoryProps = {
  type: "Transfer" | "Deposit" | "Withdrawal";
};
export class RecentHistory extends Component<IRecentHistoryProps> {
  toRouter = () => {
    const { type } = this.props;
    history.push({
      pathname: "/home/walletManagement/history",
      state: { type },
    });
  };
  render() {
    const { type } = this.props;
    return (
      <div className='recentHistory'>
        <div className='recentHistory-top'>
          <span className='recentHistory-top-title'>
            <FormattedMessage
              id='Recent_History'
              values={{
                type: <FormattedMessage id={type} />,
              }}
            />
          </span>
          <span className='recentHistory-top-viewAll' onClick={this.toRouter}>
            <FormattedMessage id='View_All'/>
          </span>
        </div>
        {type === "Deposit" ? (
          <DepositTable />
        ) : type === "Transfer" ? (
          <TransferTable />
        ) : (
          <WithdrawTable />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RecentHistory);
