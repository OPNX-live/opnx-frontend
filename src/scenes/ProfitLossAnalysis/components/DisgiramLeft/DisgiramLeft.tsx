import React, { useEffect } from "react";
import { connect } from "react-redux";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { option } from "./data";
import * as echarts from "echarts";
import "./DisgiramLeft.scss";
import Tooltip from "antd/lib/tooltip";
import { newWorth } from "service/http/http";
import { toThousands } from "utils";
import { WrappedComponentProps } from "react-intl";
import moment from "moment";
let myChart: any;
interface IDisgiramProps {
  date: { start: string; end: string };
  hide: boolean;
  pnl: {
    pnlRatio: string;
    todayPnl: string;
  };
  balance: {
    marketValue: string;
    tradingType: string;
    balance: string;
  };
}
export const DisgiramLeft = ({
  date,
  hide,
  pnl,
  balance,
  intl,
}: IDisgiramProps & WrappedComponentProps) => {
  useEffect(() => {
    myChart = echarts.init(document.getElementById("chat"));
    newWorth(date).then((res) => {
      if (res.success) {
        const xData: string[] = [];
        const yData: string[] = [];
        const diff = moment(date.end).diff(moment(date.start), "days");
        const times: string[] = [];
        for (let i = diff; i >= 0; i--) {
          times.push(moment(date.start).add(i, "days").format("YYYY-MM-DD"));
        }
        const data = times.map((item: string) => {
          const arr = res.data.filter(
            (r: { snapshotUsd: string; snapshotDate: string }) =>
              r.snapshotDate === item
          );
          if (arr.length) {
            return {
              snapshotUsd: arr[0].snapshotUsd,
              snapshotDate: item,
            };
          } else {
            return {
              snapshotUsd: 0,
              snapshotDate: item,
            };
          }
        });
        data.sort(
          (a: { snapshotDate: string }, b: { snapshotDate: string }) => {
            return a.snapshotDate < b.snapshotDate ? -1 : 1;
          }
        );
        data.forEach((i: { snapshotDate: string; snapshotUsd: string }) => {
          xData.push(i.snapshotDate.slice(5));
          yData.push(i.snapshotUsd);
        });
        option.xAxis.data = xData;
        option.series[0].data = yData;
        myChart.setOption(option, true);
      }
    });
  }, [date]);
  return (
    <div className="disgiram-left">
      <div className="top">
        {intl.formatMessage({ id: "AssetNetWorth" })}{" "}
        <Tooltip
          color="white"
          getPopupContainer={(r) => r}
          title={intl.formatMessage({ id: "AssetNetWorth_day" })}
        >
          <ExclamationCircleOutlined />
        </Tooltip>
        <span className="avbl">
          {!hide
            ? "******"
            : balance.tradingType === "USD"
            ? toThousands(balance.marketValue)
            : toThousands(balance.balance)}
        </span>
      </div>
      <div id="chat" style={{ width: "100%", height: 220 }}></div>;
    </div>
  );
};

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DisgiramLeft);
