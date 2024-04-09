import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import * as echarts from "echarts";
import { homeBalanceChar } from "service/http/http";
import { message, Tooltip } from "antd";
import { messageError } from "utils";
import "./index.scss";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import numeral from "numeral";
import { WrappedComponentProps } from "react-intl";
const colors: any = ["#F74E5E", "#F7A353", "#F7CE58", "#4FCF6A", "#3C8EF8", "#B270D5"];
export const numer = (n: string | number) => {
  if (Number(n) > 1000 && Number(n) < 1000000) {
    return numeral(n).format("0 a");
  } else if (Number(n) > 1000000) {
    return numeral(n).format("0.0 a");
  } else {
    return Number(n);
  }
};
type IProps = {
  date: { start: string; end: string };
  hide: boolean;
} & WrappedComponentProps;
let myChart: any;
export const AssetChar = (props: IProps) => {
  const [datas, setDatas] = useState([]);
  // eslint-disable-next-line
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeCoin, setActiveCoin] = useState<string>("");

  const initAssetChart = () => {
    const element = document.getElementById("assetChart");
    myChart = echarts.init(element as HTMLDivElement);
    const option = {
      tooltip: {
        trigger: "item",
        extraCssText: "width:170px;",
        formatter: (param: any) => {
          return `${param.name}: ${numer(param.data.quantity)} (${param.percent}%)`;
        },
        showContent: true,
        position: ["50%", "50%"],
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
          data:
            props.hide && datas.length
              ? datas
              : [
                  {
                    value: "0.00",
                    name: "Others",
                    quantity: 0,
                    quantityBalance: 0,
                    itemStyle: {
                      color: "rgba(55,52,78,0.08)",
                    },
                  },
                ],
        },
      ],
    };
    myChart.setOption(option);
  };
  useEffect(() => {
    initAssetChart();
    // eslint-disable-next-line
  }, [datas, props.hide]);
  useEffect(() => {
    initAssetChart();
    onChars();
    // eslint-disable-next-line
  }, []);

  const onChars = () => {
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
          .filter((i: any) => Number(i.quantity) !== 0 && i.name !== "USDC");
        arr.forEach((item: IBalanceDetails, index: number) => {
          if (index < 5) {
            arrs.push({
              value: item.values < 0 ? 0 : item.values,
              quantityBalance: item.quantity,
              quantity: item.quantity < 0 ? 0 : item.quantity,
              name: item.name,
              itemStyle: {
                color: res.data.totals.totalAmount <= 0 ? "rgba(20,22,25,1)" : colors[index],
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
          quantityBalance = Number(quantityBalance) + Number(item.quantityBalance);
        });
        if (other.length) {
          arrs = [
            ...arrs,
            {
              value: other[0].value,
              name: "Others",
              quantity: other[0].quantity,
              quantityBalance: other[0].quantityBalance,
              itemStyle: {
                color: "rgba(55,52,78,0.8)",
              },
            },
          ];
        }
        setDatas(
          res.data.totals.totalAmount > 0
            ? arrs
            : [
                {
                  value: "0.00",
                  name: "Others",
                  quantity: 0,
                  quantityBalance: 0,
                  itemStyle: {
                    color: "rgba(55,52,78,0.08)",
                  },
                },
              ]
        );
        setTotalCount(res.data.totals.totalCount ? res.data.totals.totalCount : 0);
        setTotalAmount(res.data.totals.totalAmount ? res.data.totals.totalAmount : 0);
      } else {
        message.error(res.message);
      }
    });
  };
  return (
    <div>
      {/* <div className="sm-asset "></div> */}
      <div className="asset-chart">
        <div className="top">
          {props.intl.formatMessage({ id: "AssetAllocation" })} {"  "}
          <Tooltip color="white" getPopupContainer={(r) => r} title={props.intl.formatMessage({ id: "TodayPnl" })}>
            <ExclamationCircleOutlined />
          </Tooltip>
          {/* <span className="avbl">
         {!props.hide ? '******' : props.pnl.todayPnl}
       </span> */}
        </div>
        <div id="assetChart" style={{ width: "220px", height: "220px" }}></div>
        <div className="coin">
          {totalAmount && totalAmount > 0
            ? datas.map((item: any, index) => (
                <div
                  className={`point-list ${item.name === activeCoin ? "point-list-active" : ""}`}
                  key={index}
                  onMouseMove={() => {
                    setActiveCoin(item.name);
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
                    setActiveCoin("");
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
                  <div className="point-cion" style={{ backgroundColor: colors[index] }}></div>
                  <div className="point-name"> {item.name} </div>
                  <div className="point-amount">
                    {item.name === "Others"
                      ? null
                      : !props.hide
                      ? "****"
                      : item.quantityBalance.toString() !== "0"
                      ? item.quantityBalance
                      : "0"}
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: {}) => ({});

const mapDispatchToProps = {};
AssetChar.displayName = "AssetChar";
export default connect(mapStateToProps, mapDispatchToProps)(React.memo(AssetChar));
