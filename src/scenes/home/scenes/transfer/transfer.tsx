import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { ITransferState, IAccountResult } from "./type";
import "./transfer.scss";
import { Row, Select, Input, Button, message } from "antd";
import Transform from "assets/image/transform.svg";
import Warning from "assets/image/warning.svg";
import { RecentHistory } from "components/recentHistory/RecentHistory";
import {
  getTransferAccount,
  makeTransfer,
  havePosition,
  getAllCoin,
  getTransferBalances,
  getAccuracy,
  UserData,
} from "service/http/http";
import { messageSuccess, toCoinAccuracy } from "utils";
import { EnumTradingType } from "schemas/index.enum";
import { Loadding } from "components/loadding";
import { setRefresh } from "store/actions/publicAction";
import { WrappedComponentProps, injectIntl } from "react-intl";
import history from "router/history";
const { Option } = Select;

type ITransferPropsState = ReturnType<typeof mapStateToProps>;
type ITransferDispatchState = ReturnType<typeof mapDispatchToProps>;
type ITransferProps = ITransferPropsState &
  ITransferDispatchState &
  WrappedComponentProps;

class Transfer extends PureComponent<ITransferProps, ITransferState> {
  readonly state: ITransferState = {
    loading: 1,
    isCheck: false,
    accountListResult: [],
    accountParams: {
      fromAccountId: "",
      toAccountId: "",
      transferInstrument: "",
      transferAmount: "",
    },
    coinList: [],
    allCoinList: [],
    available: "",
    accuracy: null,
  };
  tradingType = EnumTradingType as { [key: string]: string };

  constructor(props: ITransferProps) {
    super(props);
    this.makeFromOption.bind(this);
    this.makeToOption.bind(this);
    this.makeCoin.bind(this);
    this.getAccuracy.bind(this);
  }

  async getAccountList() {
    const result = await getTransferAccount();
    const res = await UserData();
    result.success &&
      this.setState({ accountListResult: result.data }, () => {
        const state = history.location.state;
        if (state && state !== {}) {
          this.setState(
            {
              accountParams: {
                ...this.state.accountParams,
                fromAccountId: (state as { accountId: string })["accountId"],
              },
            },
            this.getCoin
          );
        } else {
          this.setState(
            {
              accountParams: {
                ...this.state.accountParams,
                fromAccountId: res.data.accountId,
              },
            },
            this.getCoin
          );
        }
      });
    !result.success && message.error(result.message);
  }
  async getCoin() {
    const { fromAccountId } = this.state.accountParams;
    if (fromAccountId) {
      this.setState({ loading: 1 });
      const result = await getTransferBalances(fromAccountId);
      result.success &&
        this.setState({
          coinList: result.data,
          available:
            result.data.find(
              (p: any) =>
                p.instrumentId === this.state.accountParams.transferInstrument
            )?.available || "",
        });
      !result.success && message.error(result.message);
      this.setState({ loading: 0 });
      return Promise.resolve(true);
    } else {
      this.setState({ coinList: [] });
      return Promise.resolve(true);
    }
  }
  async getAccuracy() {
    const result = await getAccuracy();
    result.success && this.setState({ accuracy: result.data });
    !result.success && message.error(result.message);
  }
  async getAllCoin() {
    const result = await getAllCoin();
    result.success && this.setState({ allCoinList: result.data });
    !result.success && message.error(result.message);
  }
  async makeTransfer() {
    this.setState({ loading: 1 });
    const payload = {
      isAllFrom:
        this.state.accountParams.fromAccountId === "ALL" ? true : false,
      isAllCoin:
        this.state.accountParams.transferInstrument === "ALL" ? true : false,
      fromAccountId: this.state.accountParams.fromAccountId,
      toAccountId: this.state.accountParams.toAccountId,
      transferInstrument: this.state.accountParams.transferInstrument,
      transferAmount: this.state.accountParams.transferAmount,
    };
    const result = await makeTransfer(payload);
    if (result.success) {
      setTimeout(() => {
        this.props.setRefresh(true);
      }, 500);
      message.success(messageSuccess("30002"));
      this.setState({
        accountParams: {
          fromAccountId: "",
          toAccountId: "",
          transferInstrument: "",
          transferAmount: "",
        },
        available: "",
        coinList: [],
      });
    } else {
      message.error(result.message);
      if (result.code === "31001") {
        this.getCoin();
      }
    }
    this.setState({ loading: 0 });
  }

  async getCheck(accountId: string) {
    const result = await havePosition(accountId);
    result.success && this.setState({ isCheck: result.data });
  }
  async componentDidMount() {
    this.setState({ loading: 1 });
    await Promise.all([
      this.getAccountList(),
      this.getAllCoin.bind(this)(),
      this.getAccuracy(),
    ]);
    this.setState({ loading: 0 });
  }
  componentWillUnmount() {
    this.setState = () => {
      return;
    };
  }
  makeFromOption() {
    return (
      <>
        <Option value="ALL" key="ALL">
          Select all accounts
        </Option>
        {this.state.accountListResult.map((p: IAccountResult) => {
          return (
            <Option
              value={p.accountId}
              key={p.accountId}
              disabled={p.accountId === this.state.accountParams.toAccountId}
            >
              <span>{p.accountName}</span>
              {/* <span>&nbsp;/ {this.tradingType[p.tradingType]}</span> */}
            </Option>
          );
        })}
      </>
    );
  }

  makeToOption() {
    return this.state.accountListResult.map((p: IAccountResult) => {
      return (
        <Option
          value={p.accountId}
          key={p.accountId}
          disabled={p.accountId === this.state.accountParams.fromAccountId}
        >
          <span>{p.accountName}</span>
          {/* <span>&nbsp;/ {this.tradingType[p.tradingType]}</span> */}
        </Option>
      );
    });
  }
  dataOption() {
    return this.state.accountListResult.length === 1;
  }
  makeCoin() {
    return (
      <>
        <Option value="ALL" key="ALL">
          Select all coins
        </Option>
        {this.state.allCoinList.map((p) => {
          return (
            <Option value={p} key={p}>
              {p}
            </Option>
          );
        })}
      </>
    );
  }
  accuracyPrecision = (length?: string | number) => {
    if (length) {
      let a = "1";
      for (let i = 0; i < +length - 1; i++) {
        a = "0" + a;
      }
      return "0." + a;
    } else {
      return "0";
    }
  };
  render() {
    const { intl } = this.props;
    return (
      <Loadding show={this.state.loading}>
        <Row className="cf-transfer">
          <Row className="transfer-header">
            {this.props.intl.formatMessage({
              id: "Transfer",
              defaultMessage: "Transfer",
            })}
          </Row>
          <Row className="transfer-from">
            <Row className="transfer-account">
              {this.props.intl.formatMessage({
                id: "Account",
                defaultMessage: "Account",
              })}
            </Row>

            <Row className="transfer-container">
              <Row className="transfer-input-row">
                <Row className="transfer-input">
                  <Row className="transfer-input-title">
                    {intl.formatMessage({ id: "From" })}
                  </Row>
                  <Select
                    getPopupContainer={(triggerNode) => triggerNode}
                    onChange={(e: string) => {
                      this.setState(
                        {
                          accountParams: {
                            ...this.state.accountParams,
                            fromAccountId: e,
                            toAccountId: this.dataOption()
                              ? this.props.intl.formatMessage({
                                  id: "No account available",
                                  defaultMessage: "No account available",
                                })
                              : this.state.accountParams.toAccountId,
                          },
                        },
                        () => {
                          e !== "ALL" && this.getCoin();
                          // result &&
                          //   this.setState({
                          //     available:
                          //       this.state.coinList.find(
                          //         (p) =>
                          //           p.instrumentId ===
                          //           this.state.accountParams.transferInstrument
                          //       )?.available || "",
                          //     // accountParams: {
                          //     //   ...this.state.accountParams,
                          //     //   transferInstrument: "",
                          //     // },
                          //   });
                        }
                      );
                      e !== "ALL" && this.getCheck(e);
                    }}
                    value={this.state.accountParams.fromAccountId}
                  >
                    {this.makeFromOption()}
                  </Select>
                </Row>

                <Row className="transfer-input-transform">
                  <Row
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (this.state.accountParams.fromAccountId !== "ALL") {
                        this.setState(
                          {
                            accountParams: {
                              ...this.state.accountParams,
                              fromAccountId:
                                this.state.accountParams.toAccountId,
                              toAccountId:
                                this.state.accountParams.fromAccountId,
                            },
                          },
                          async () => {
                            if (this.dataOption()) {
                              return;
                            }
                            const result = await this.getCoin();
                            result &&
                              this.setState(
                                {
                                  available:
                                    this.state.coinList.find(
                                      (p) =>
                                        p.instrumentId ===
                                        this.state.accountParams
                                          .transferInstrument
                                    )?.available || "",
                                },
                                () => {
                                  this.getCheck(
                                    this.state.accountParams.fromAccountId
                                  );
                                }
                              );
                          }
                        );
                      }
                    }}
                  >
                    <img src={Transform} alt="transform" />
                  </Row>
                </Row>

                <Row className="transfer-input">
                  <Row className="transfer-input-title">
                    {this.props.intl.formatMessage({
                      id: "To",
                      defaultMessage: "To",
                    })}
                  </Row>
                  <Select
                    getPopupContainer={(triggerNode) => triggerNode}
                    value={this.state.accountParams.toAccountId}
                    onChange={(e: string) => {
                      this.setState(
                        {
                          accountParams: {
                            ...this.state.accountParams,
                            toAccountId: e,
                            fromAccountId: this.dataOption()
                              ? this.props.intl.formatMessage({
                                  id: "No account available",
                                  defaultMessage: "No account available",
                                })
                              : this.state.accountParams.fromAccountId,
                          },
                        },
                        () => {
                          if (this.dataOption()) {
                            return;
                          }
                          // const result = this.getCoin();
                          // result &&
                          // this.setState({
                          //   available: "",
                          //   accountParams: {
                          //     ...this.state.accountParams,
                          //     transferInstrument: "",
                          //   },
                          // });
                        }
                      );
                    }}
                  >
                    {this.makeToOption()}
                  </Select>
                </Row>
              </Row>

              <Row className="transfer-input-row">
                <Row className="transfer-input">
                  <Row className="transfer-input-title">
                    {this.props.intl.formatMessage({
                      id: "Coin",
                      defaultMessage: "Coin",
                    })}
                  </Row>
                  <Select
                    getPopupContainer={(triggerNode) => triggerNode}
                    value={this.state.accountParams.transferInstrument}
                    showSearch
                    onChange={(e: string) => {
                      console.log(e);
                      this.setState({
                        accountParams: {
                          ...this.state.accountParams,
                          transferInstrument: e,
                        },
                        available: this.state.coinList.find(
                          (p) => p.instrumentId === e
                        )?.available as string,
                      });
                    }}
                  >
                    {this.makeCoin()}
                  </Select>
                </Row>

                {!Boolean(
                  this.state.accountParams.fromAccountId === "ALL" ||
                    this.state.accountParams.transferInstrument === "ALL"
                ) && (
                  <Row className="transfer-input ">
                    <div
                      className="transfer-amount-max"
                      onClick={() => {
                        if (this.state.available) {
                          this.setState({
                            accountParams: {
                              ...this.state.accountParams,
                              transferAmount: this.state.available,
                            },
                          });
                        }
                      }}
                    >
                      {this.props.intl.formatMessage({
                        id: "MAX",
                        defaultMessage: "MAX",
                      })}
                    </div>
                    <Row
                      className="transfer-prompt"
                      style={{
                        display:
                          Number(this.state.accountParams.transferAmount) >
                          Number(this.state.available)
                            ? "block"
                            : "none",
                      }}
                    >
                      {this.props.intl.formatMessage({
                        id: "Amount exceeds available balance",
                        defaultMessage: "Amount exceeds available balance",
                      })}
                    </Row>
                    <Row className="transfer-input-title">
                      <span>
                        {this.props.intl.formatMessage({
                          id: "Amount",
                          defaultMessage: "Amount",
                        })}
                      </span>
                      <span>
                        {this.props.intl.formatMessage({
                          id: "avbl",
                          defaultMessage: "Avbl",
                        })}
                        : {this.state.available || 0}
                      </span>
                    </Row>
                    <Input
                      type="number"
                      value={this.state.accountParams.transferAmount}
                      disabled={
                        this.state.accountParams.transferInstrument
                          ? false
                          : true
                      }
                      className="transfer-input-amount"
                      onChange={(e) => {
                        const value = e.target.value;
                        // eslint-disable-next-line
                        const [integer, decimal] = value.split(".");
                        if (
                          decimal &&
                          decimal.length <=
                            Number(
                              this.state.accuracy?.[
                                this.state.accountParams.transferInstrument
                              ]
                            )
                        ) {
                          this.setState({
                            accountParams: {
                              ...this.state.accountParams,
                              transferAmount: value,
                            },
                          });
                        } else if (!decimal) {
                          this.setState({
                            accountParams: {
                              ...this.state.accountParams,
                              transferAmount: value,
                            },
                          });
                        } else if (
                          decimal &&
                          decimal.length >=
                            Number(
                              this.state.accuracy?.[
                                this.state.accountParams.transferInstrument
                              ]
                            )
                        ) {
                          this.setState({
                            accountParams: {
                              ...this.state.accountParams,
                              transferAmount: toCoinAccuracy(
                                value,
                                this.state.accuracy?.[
                                  this.state.accountParams.transferInstrument
                                ]
                              ),
                            },
                          });
                        }
                      }}
                    />
                  </Row>
                )}
              </Row>
            </Row>

            <Row
              className="transfer-warning"
              style={{ display: this.state.isCheck ? "flex" : "none" }}
            >
              <Row className="transfer-warning-box">
                <img src={Warning} alt="warning" />
                <Row className="transfer-warning-content">
                  <Row>
                    {this.props.intl.formatMessage({
                      id: "withdraw_position",
                      defaultMessage: "You currently have open positions",
                    })}
                  </Row>
                  <Row>
                    {this.props.intl.formatMessage({
                      id: "transferring",
                      defaultMessage:
                        "Transferring coins increases your risk of liquidation.",
                    })}{" "}
                    <br />
                    {this.props.intl.formatMessage({
                      id: "tran_position",
                      defaultMessage:
                        "It is recommended you transfer only after closing all open positions",
                    })}
                  </Row>
                </Row>
              </Row>
            </Row>
          </Row>
          <Row className="btn">
            <Button
              type="primary"
              disabled={
                (this.state.accountParams.transferInstrument === "ALL" ||
                  this.state.accountParams.fromAccountId === "ALL") &&
                this.state.accountParams.fromAccountId &&
                this.state.accountParams.toAccountId
                  ? false
                  : Number(this.state.accountParams.transferAmount) > 0 &&
                    Number(this.state.accountParams.transferAmount) <=
                      Number(this.state.available)
                  ? false
                  : true
              }
              onClick={() => {
                this.makeTransfer();
              }}
            >
              {this.props.intl.formatMessage({
                id: "Submit",
                defaultMessage: "Submit",
              })}
            </Button>
          </Row>
          <Row className="transfer-table">
            <RecentHistory type="Transfer" />
          </Row>
        </Row>
      </Loadding>
    );
  }
}
const mapStateToProps = (
  state: {
    users: Iusers & { accountId: string };
    dashboardUserData: IDashboardUserData;
  } & any
) => {
  return {
    userData: state.users,
    dashboardUserData: state.dashboardUserData,
    kycOpened: state.kycInfo?.kycOpened,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setRefresh(data: boolean) {
      dispatch(setRefresh(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Transfer));
