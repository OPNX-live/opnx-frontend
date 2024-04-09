import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Tabs, Table, message, Alert } from "antd";
import Tooltip from "components/TooltipGlobal/Tooltip";
import { tabSubAccount, SwitchAccout, userPosition } from "service/http/http";
import { setUser } from "store/actions/publicAction";
import messageError from "utils/errorCode";
import { tradingType } from "../dashboard/components/dashboardBottom/data";
import { toThousands } from "utils/calc";
import "./position.scss";
import { Loadding } from "components/loadding";
import { TableNoData } from "components/publicComponent/publicComponent";
import { WrappedComponentProps, injectIntl } from "react-intl";

const { TabPane } = Tabs;
type IPositionState = {
  tabSubAccount: ITabSubAccount[];
  currentAccount: ITabSubAccount;
  userData: IDashboardUserData | undefined;
  positionData: any;
  pnl: number;
  loading: number;
};
type IPositionPropsState = ReturnType<typeof mapStateToProps>;
type IPositionDispatchState = ReturnType<typeof mapDispatchToProps>;
type IPositionDisplayProps = IPositionPropsState &
  IPositionDispatchState &
  WrappedComponentProps;
enum EnumContracts {
  "BUY" = "#09BB07",
  "SELL" = "#F73461",
}
enum EnumContractsText {
  "BUY" = "Long",
  "SELL" = "Short",
}
enum EnumPNL {
  "LINEAR" = "USDT",
  "INVERSE_BTC" = "BTC",
  "INVERSE_ETH" = "ETH",
}
class Position extends PureComponent<IPositionDisplayProps, IPositionState> {
  enumContracts: { [key: string]: string } = EnumContracts;
  enumContractsText: { [key: string]: string } = EnumContractsText;
  enumPNL: { [key: string]: string } = EnumPNL;

  columns = [
    {
      title: "Markets",
      dataIndex: "contracts",
      render: (item: any, data: any) => {
        return (
          <div
            style={{
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "16px",
                backgroundColor: this.enumContracts[data.positionType],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#E5DFF5",
                marginRight: "4px",
                borderRadius: "2px",
              }}
            >
              {this.props.intl.formatMessage({
                id: this.enumContractsText[data.positionType],
                defaultMessage: this.enumContractsText[data.positionType],
              })}
            </div>
            <div style={{ fontSize: "14px" }}>{item}</div>
          </div>
        );
      },
    },
    {
      title: this.props.intl.formatMessage({ id: "Size" }),
      dataIndex: "size",
      align: "right",
      render: (_item: any) => {
        return (
          <p style={{ fontSize: "16px" }}>
            {toThousands((_item * 1).toFixed(4))}
          </p>
        );
      },
    },
    {
      title: "Entry Price (USDT)",
      dataIndex: "entryPrice",
      align: "right",
      render: (_item: any) => {
        return (
          <p style={{ fontSize: "16px" }}>
            {toThousands((_item * 1).toFixed(4))}
          </p>
        );
      },
    },
    {
      title: this.props.intl.formatMessage({ id: "Market_Price" }),
      dataIndex: "marketPrice",
      align: "right",
      render: (_item: any) => {
        return (
          <p style={{ fontSize: "16px" }}>
            {toThousands((_item * 1).toFixed(4))}
          </p>
        );
      },
    },
    {
      title: this.props.intl.formatMessage({ id: "PNL" }),
      dataIndex: "pnl",
      align: "right",
      render: (_item: any, data: any) => {
        return (
          <p
            style={{
              fontSize: "16px",
              color: this.getColor(_item),
            }}
          >
            {toThousands((_item * 1).toFixed(4))}
          </p>
        );
      },
    },
    {
      title: this.props.intl.formatMessage({ id: "Liquidation_Price" }),
      dataIndex: "liquidationPrice",
      align: "right",
      render: (_item: any) => {
        return (
          <p style={{ fontSize: "16px" }}>
            {Number(_item) > 0 ? toThousands((_item * 1).toFixed(4)) : "--"}
          </p>
        );
      },
    },
    {
      title: this.props.intl.formatMessage({ id: "Actions" }),
      dataIndex: "english",
      align: "right",
      render: (_item: any, data: any) => {
        return (
          <p
            style={{
              fontSize: "14px",
              cursor: "pointer",
              color: "#318BF5",
            }}
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_MARKETS_URL}/${data.contracts}`;
            }}
          >
            {this.props.intl.formatMessage({ id: "Trade" })}
          </p>
        );
      },
    },
  ] as any;
  constructor(props: IPositionDisplayProps) {
    super(props);
    this.state = {
      tabSubAccount: [],
      userData: undefined,
      positionData: [],
      pnl: 0,
      loading: 1,
      currentAccount: {} as ITabSubAccount,
    };
    this.getData = this.getData.bind(this);
  }

  getColor(pnl: string): string {
    if (Number(pnl) === 0) {
      return "#E5DFF5";
    }
    if (Number(pnl) > 0) {
      return "#09BB07";
    }
    if (Number(pnl) < 0) {
      return "#F73461";
    }
    return "#E5DFF5";
  }

  makePnl(data: any[]) {
    let all = 0;
    data.map((p) => {
      return (all += Number(p.pnl));
    });
    return all;
  }

  componentDidMount() {
    this.getData();
  }
  componentWillUnmount() {
    this.setState = () => {
      return;
    };
  }
  async getData() {
    this.setState({ loading: 1 });
    const accountResults = await tabSubAccount();
    accountResults.code === "0000" &&
      this.setState({ tabSubAccount: accountResults.data }, () => {
        this.findAccountData(
          this.props.users.accountName,
          (res: ITabSubAccount) => {
            this.setState({ currentAccount: res });
            this.getUserPosition(res);
          }
        );
      });
    accountResults.code !== "0000" &&
      message.error(messageError(accountResults.code));

    this.setState({ loading: 0 });
  }

  async getUserPosition(res: ITabSubAccount) {
    const tablePositionResults = await userPosition(res.accountId);
    if (tablePositionResults.code === "0000") {
      this.setState({
        positionData: tablePositionResults.data,
        pnl: this.makePnl(tablePositionResults.data),
      });
      console.log(tablePositionResults.data.length);
    }

    tablePositionResults.code !== "0000" &&
      message.error(messageError(tablePositionResults.code));
  }

  findAccountData(accountName: string, callback: Function) {
    const findResult = this.state.tabSubAccount.find(
      (p) => p.accountName === accountName
    ) as ITabSubAccount;
    return callback(findResult);
  }

  async tabClick(e: string) {
    if (e !== this.state.currentAccount.accountName) {
      this.setState({ loading: 1 });
      this.findAccountData(e, async (res: ITabSubAccount) => {
        if (res.isValid) {
          const switchAccoutResults = await SwitchAccout(res.accountId);
          switchAccoutResults.success &&
            this.props.setUser(switchAccoutResults.data);
          !switchAccoutResults.success &&
            message.error(messageError(switchAccoutResults.code));
        }
        this.setState({ currentAccount: res });
        this.getUserPosition(res);
        this.setState({ loading: 0 });
      });
    }
  }

  checkedPermissions(canTrade: boolean, canWithdraw: boolean) {
    if (canTrade && canWithdraw) {
      return this.props.intl.formatMessage({
        id: "ALL",
        defaultMessage: "ALL",
      });
    } else if (canTrade) {
      return this.props.intl.formatMessage({
        id: "Can_Trade",
        defaultMessage: "ALL",
      });
    } else if (canWithdraw) {
      return this.props.intl.formatMessage({
        id: "CanWithdraw",
        defaultMessage: "Can Withdraw",
      });
    } else {
      return this.props.intl.formatMessage({
        id: "Read-Only",
        defaultMessage: "Read-Only",
      });
    }
  }

  usUserPositionAlert = (positionData: any) => {
    const { intl, dashboardUserData } = this.props;
    if (
      dashboardUserData &&
      dashboardUserData.sourceType === "US" &&
      positionData &&
      positionData.length > 0
    ) {
      return (
        <Alert
          banner={true}
          message={intl.formatMessage({
            id: "You are currently trading inside the US region. According to the regulations, the maximum duration for holding a position is 25 days, and it will be closed automatically thereafter",
          })}
          type="warning"
          closable
          onClose={this.onClose}
        />
      );
    }
  };

  onClose = () => {};

  render() {
    const { tabSubAccount, positionData } = this.state;
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loading}>
        <div className="position">
          <div className="position-top">
            <div className="position-title">
              {intl.formatMessage({ id: "Position" })}
            </div>
            <Tabs
              activeKey={this.state.currentAccount.accountName}
              style={{ height: 50 }}
              tabPosition="top"
              onTabClick={this.tabClick.bind(this)}
            >
              {[...tabSubAccount].map((i: ITabSubAccount, index: number) => (
                <TabPane
                  tab={
                    <Tooltip
                      placement="top"
                      title={
                        index === 0
                          ? intl.formatMessage({ id: "Main_Account" })
                          : i.accountName
                      }
                      overlayClassName="position-Tooltip"
                    >
                      <div className="position-tab">
                        {index === 0
                          ? intl.formatMessage({ id: "Main_Account" })
                          : i.accountName}
                      </div>
                    </Tooltip>
                  }
                  key={i.accountName}
                ></TabPane>
              ))}
            </Tabs>
          </div>
          {this.usUserPositionAlert(positionData)}
          <div className="position-dashboardHeaher">
            <div className="position-dashboardHeaher-user">
              <div className="position-dashboardHeaher-user-item1">
                {intl.formatMessage({ id: "PNL" })}:
              </div>
              <div className="position-dashboardHeaher-user-item2">
                <p>
                  {toThousands((this.state.pnl * 1).toFixed(4))}&nbsp;
                  <span style={{ fontSize: "12px" }}>
                    {this.state.currentAccount
                      ? this.enumPNL[this.state.currentAccount!.tradingType]
                      : ""}
                  </span>
                </p>
              </div>
            </div>
            <div className="position-dashboardHeaher-main">
              <p>{intl.formatMessage({ id: "Account" })}</p>
              <Tooltip
                placement="top"
                overlayClassName="position-Tooltip"
                title={this.state.currentAccount?.accountName}
              >
                <div className="position-dashboardHeaher-main-account">
                  {this.state.currentAccount?.accountName ===
                  this.state.tabSubAccount[0]?.accountName
                    ? this.props.intl.formatMessage({
                        id: "MainAccount",
                        defaultMessage: "Main Account",
                      })
                    : this.state.currentAccount.accountName}
                </div>
              </Tooltip>
              {/* <div className="position-dashboardHeaher-main-item flex-item1">
                {intl.formatMessage({ id: "Margin_Type" })}:
                <span style={{ marginLeft: "8px" }}>
                  {this.state.currentAccount ? tradingType(this.state.currentAccount!.tradingType) : ""}
                </span>
              </div> */}
              <div className="position-dashboardHeaher-main-item flex-item2">
                {intl.formatMessage({ id: "Permission" })}:
                <span style={{ marginLeft: "8px" }}>
                  {this.state.currentAccount
                    ? this.checkedPermissions(
                        this.state.currentAccount!.canTrade,
                        this.state.currentAccount!.canWithdraw
                      )
                    : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="position-table">
            <Table
              columns={this.columns}
              dataSource={positionData}
              pagination={false}
              scroll={{ x: true }}
              rowKey={(recode: any) => recode}
              locale={{
                emptyText: TableNoData(
                  intl.formatMessage({ id: "No_Position" })
                ),
              }}
            />
          </div>
        </div>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  dashboardUserData: state.dashboardUserData,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser(data: Iusers) {
      dispatch(setUser(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Position));
