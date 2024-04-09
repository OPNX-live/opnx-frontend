import React, { Component } from "react";
import { connect } from "react-redux";
import right from "assets/image/right-btn.svg";
import * as echarts from "echarts";
import { imgList } from "../../data.js";
import FLEXAssets from "assets/image/flexassets.png";
import "./balancedetails.scss";
import { Row, Col, message } from "antd";
import { homeBalanceChar } from "service/http/http";
import messageError from "utils/errorCode";
import history from "router/history";
import { toLocaleString } from "utils/toLocaleString";
import { balanceTradingType, toCoinAccuracy, toThousands } from "utils";
import { WrappedComponentProps, injectIntl } from "react-intl";

type IProps = {
  userData: IDashboardUserData;
};

type IState = {
  datas: any;
  options: {};
  myChart: any;
  totalAmount: number | undefined;
  totalCount: number | undefined;
  isAmount: boolean;
  activeCoin: string;
};

const colors: any = [
  "#F74E5E",
  "#F7A353",
  "#F7CE58",
  "#4FCF6A",
  "#3C8EF8",
  "#B270D5",
];

type IBalanceDetailsPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IBalanceDetailsDispatchState = ReturnType<typeof mapDispatchToProps> &
  IProps &
  IBalanceDetailsPropsState;

class BalanceDetails extends Component<IBalanceDetailsDispatchState, IState> {
  constructor(props: IBalanceDetailsDispatchState) {
    super(props);
    this.state = {
      datas: [],
      options: {},
      myChart: null,
      totalAmount: undefined,
      totalCount: undefined,
      isAmount: false,
      activeCoin: "",
    };
  }
  componentDidMount() {
    const _this = this;
    const s: any = [
      {
        value: 0,
        name: "Other",
        quantity: 0,
        quantityBalance: 0,
        itemStyle: {
          color: "#31353D",
        },
      },
    ];
    _this.setState(
      {
        myChart: echarts.init(document.getElementById("chart")),
        datas: s,
      },
      () => {
        const index = 0;
        _this.state.myChart.setOption({
          tooltip: {
            trigger: "item",
            formatter: (param: any) => {
              return `${param.name}: ${param.data.quantity} (${param.percent}%)`;
            },
          },
          legend: {
            show: false,
            right: 0,
            textStyle: { color: "#FFFFFF" },
          },
          series: [
            {
              name: "ETH2",
              type: "pie",
              radius: ["50%", "65%"],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: "14",
                  fontWeight: "bold",
                },
              },
              // labelLine: {
              //   show: true,
              // },
              data: this.state.datas,
            },
          ],
        });

        this.state.myChart.on("mouseover", function (e: any) {
          _this.setState({ activeCoin: e.name });
          if (e.dataIndex !== index) {
            _this.state.myChart.dispatchAction({
              type: "downplay",
              seriesIndex: 0,
              dataIndex: index,
            });
          }
        });
        this.state.myChart.on("mouseout", function (e: any) {
          _this.setState({ activeCoin: "" });
        });
      }
    );
    this.homeBalanceChar();
  }

  onAmount = (amount?: number) => {
    if (amount) {
      let res = "0";
      const splitAmount = amount.toString().split(".");
      if (splitAmount[1] && splitAmount[1].length >= 8) {
        res = String(amount).replace(/^(.*\..{4}).*$/, "$1");
      } else {
        res = amount.toString();
      }
      return res;
    }
    return 0;
  };

  homeBalanceChar = () => {
    homeBalanceChar().then((res) => {
      if (res.code === "0000") {
        let arrs = [] as any;
        const other = [] as any;
        const arr = res.data.datas
          .sort((a: any, b: any) => {
            const aa = a["values"];
            const bb = b["values"];
            return bb - aa;
          })
          .filter((i: any) => Number(i.quantity) !== 0);
        arr.forEach((item: IBalanceDetails, index: number) => {
          if (index < 5) {
            arrs.push({
              value: item.values < 0 ? 0 : item.values,
              quantityBalance: item.quantity,
              quantity: item.quantity < 0 ? 0 : item.quantity,
              name: item.name,
              itemStyle: {
                color:
                  res.data.totals.totalAmount <= 0 ? "#318BF5" : colors[index],
              },
            });
          } else {
            other.push({
              value: item.values < 0 ? 0 : item.values,
              quantityBalance: item.quantity,
              quantity: item.quantity < 0 ? 0 : item.quantity,
            });
          }
        });
        // tslint:disable-next-line:one-variable-per-declaration
        let value = 0,
          quantity = 0,
          quantityBalance = 0;
        other.forEach((item: any) => {
          value = Number(value) + Number(item.value);
          quantity = Number(quantity) + Number(item.quantity);
          quantityBalance =
            Number(quantityBalance) + Number(item.quantityBalance);
        });
        if (other.length) {
          arrs = [
            ...arrs,
            {
              value,
              name: "Others",
              quantity,
              quantityBalance,
              itemStyle: {
                color: "#31353D",
              },
            },
          ];
        }
        this.setState(
          {
            datas:
              res.data.totals.totalAmount > 0
                ? arrs
                : [
                    {
                      value: "0.00",
                      name: "Others",
                      quantity: 0,
                      quantityBalance: 0,
                      itemStyle: {
                        color: "#318BF5",
                      },
                    },
                  ],
            totalCount: res.data.totals.totalCount
              ? res.data.totals.totalCount
              : 0,
            totalAmount: res.data.totals.totalAmount
              ? res.data.totals.totalAmount
              : 0,
          },
          () => {
            this.state.myChart.setOption({
              tooltip: {
                trigger: "item",
                formatter: (param: any) => {
                  return `${param.name}: ${toLocaleString(
                    param.data.quantity
                  )} (${param.percent}%)`;
                },
              },
              legend: {
                show: false,
                right: 0,
                textStyle: { color: "#FFFFFF" },
              },
              series: [
                {
                  name: "Open Exchange",
                  type: "pie",
                  radius: ["50%", "65%"],
                  label: {
                    show: false,
                    position: "center",
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontSize: "14",
                      fontWeight: "bold",
                    },
                  },
                  data: this.state.isAmount
                    ? this.state.datas
                    : [
                        {
                          value: 0,
                          name: "Other",
                          quantity: 0,
                          quantityBalance: 0,
                          itemStyle: {
                            color: "#31353D",
                          },
                        },
                      ],
                },
              ],
            });
            // this.state.myChart.dispatchAction({
            //   type: 'highlight',
            //   seriesIndex: 0,
            //   dataIndex: 0,
            // });
          }
        );
      } else {
        message.error(res.message);
      }
    });
  };
  render() {
    const { userData, intl } = this.props;
    const { myChart } = this.state;
    return (
      <div className="balance-details">
        <div className="title">
          <Row style={{ width: "100%" }}>
            <Col xs={24} xl={12} style={{ lineHeight: "32px" }}>
              {intl.formatMessage({
                id: "Balance_Details",
              })}
            </Col>
            <Col xs={24} xl={12}>
              <div className="btns">
                {/* <div
                  className="deposit-btn"
                  onClick={() => history.push("/home/walletManagement/deposit")}
                >
                  {intl.formatMessage({
                    id: "Deposit",
                  })}
                </div> */}
                {this.props.users.mainLogin ? (
                  <div
                    className="deposit-btn"
                    style={{
                      background: "#31353D",
                    }}
                    onClick={() =>
                      history.push("/home/walletManagement/transfer")
                    }
                  >
                    {intl.formatMessage({
                      id: "Transfer",
                    })}
                  </div>
                ) : null}
                {this.props.users.mainLogin ? (
                  <div
                    className="deposit-btn"
                    style={{
                      background: "#31353D",
                      padding: "0 12px",
                      width: "auto",
                    }}
                    onClick={() =>
                      history.push("/home/walletManagement/withdraw")
                    }
                  >
                    {intl.formatMessage({
                      id: "Withdraw",
                    })}
                  </div>
                ) : null}
                <img
                  src={right}
                  alt=">"
                  style={{ marginLeft: "12px", cursor: "pointer" }}
                  onClick={() => {
                    history.push("/home/walletManagement/balance");
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
        <div className="account-details">
          <div className="account-details-top">
            <div className="account-details-top-left">
              <div className="account-value">
                <div className="estimated">Estimated Account Value :</div>
                <div className="eyeimg">
                  {!this.state.isAmount ? (
                    <img
                      src={imgList.yincang}
                      alt="yincang"
                      style={{ marginLeft: 10, verticalAlign: "middle" }}
                      onClick={() => {
                        this.setState(
                          {
                            isAmount: !this.state.isAmount,
                          },
                          () => {
                            this.state.myChart.setOption({
                              ...this.state.myChart.getOption(),
                              series: {
                                data: this.state.datas,
                              },
                            });
                          }
                        );
                      }}
                    />
                  ) : (
                    <img
                      src={imgList.yincang_play}
                      alt="yincang"
                      style={{ marginLeft: 10, verticalAlign: "middle" }}
                      onClick={() => {
                        this.setState({
                          isAmount: !this.state.isAmount,
                        });
                        this.state.myChart.setOption({
                          ...this.state.myChart.getOption(),
                          series: {
                            data: [
                              {
                                value: 0,
                                name: "Other",
                                quantity: 0,
                                quantityBalance: 0,
                                itemStyle: {
                                  color: "#31353D",
                                },
                              },
                            ],
                          },
                        });
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="amount">
                <div className="amount-tile">
                  {!this.state.isAmount
                    ? "******"
                    : this.state.totalAmount !== 0
                    ? toThousands(
                        toCoinAccuracy(this.onAmount(this.state.totalAmount), 4)
                      )
                    : "0"}{" "}
                  {/* {toThousands(this.state.totalAmount ?? (0).toFixed(3))} */}
                </div>
                <div
                  style={{
                    paddingLeft: "5px",
                    height: "13px",
                    fontSize: "12px",
                  }}
                >
                  {!this.state.isAmount
                    ? "****"
                    : balanceTradingType(userData.tradingType)}
                </div>
              </div>
            </div>
            {/* <span
              className="balance-title-savings btn-11"
              onClick={() =>
                (window.location.href = process.env.REACT_APP_EARN!)
              }
            >
              <img src={FLEXAssets} alt="FLEXAssets" />
              {intl.formatMessage({
                id: "Get Passive Interest",
              })}
            </span> */}
          </div>
        </div>
        <Row className="coin-titles">
          <Col xs={24} xl={8} className="coin-ul">
            <div className="coin-li">
              {this.state.totalAmount && this.state.totalAmount > 0
                ? this.state.datas.map((item: any, index: any) => {
                    return (
                      <span
                        className={`li-item ${
                          item.name === this.state.activeCoin
                            ? "li-item-active"
                            : ""
                        }`}
                        key={index}
                        onMouseMove={() => {
                          this.setState({ activeCoin: item.name });
                          myChart.dispatchAction({
                            type: "highlight",
                            name: item.name,
                          });
                          myChart.dispatchAction({
                            type: "showTip",
                            seriesIndex: 0,
                            dataIndex: index,
                          });
                        }}
                        onMouseOut={() => {
                          this.setState({ activeCoin: "" });
                          myChart.dispatchAction({
                            type: "downplay",
                            name: item.name,
                          });
                          myChart.dispatchAction({
                            type: "hideTip",
                            seriesIndex: 0,
                            dataIndex: index,
                          });
                        }}
                      >
                        <div
                          className="icon"
                          style={{ backgroundColor: colors[index] }}
                        ></div>
                        <div className="coin-name">{item.name}</div>
                        <div className="amount">
                          {item.name === "Others"
                            ? null
                            : !this.state.isAmount
                            ? "****"
                            : item.quantityBalance.toString() !== "0"
                            ? toThousands(item.quantityBalance)
                            : "0"}
                        </div>
                      </span>
                    );
                  })
                : null}
            </div>
          </Col>
          <Col xs={24} xl={8}>
            <div
              id="chart"
              style={{ width: "100%", height: "245px", margin: "0 auto" }}
            ></div>
          </Col>
          <Col xs={24} xl={8}></Col>
        </Row>
      </div>
    );
  }
}
const mapStateToProps = (state: {
  dashboardUserData: IDashboardUserData;
  users: Iusers;
}) => {
  return {
    dashboardUserData: state.dashboardUserData,
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BalanceDetails));
