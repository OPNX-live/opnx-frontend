import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import "./DisgirmPnl.scss";
import Tooltip from "antd/lib/tooltip";
import { getDailyPnl } from "service/http/http";
import moment from "moment";
import numeral from "numeral";
import { toThousands } from "utils";
import { WrappedComponentProps, injectIntl } from "react-intl";
let myChart: any;
type IProps = {
  date: { start: string; end: string };
  hide: boolean;
  pnl: { pnlRatio: string; todayPnl: string };
};
export const numer = (n: string | number) => {
  return numeral(n).format("0.0 a");
};
export const DisgirmPnl = (props: IProps & WrappedComponentProps) => {
  const [datas, setDatas] = useState({ data: [0], xAxisData: ["2020-09-10"] });
  useEffect(() => {
    myChart = echarts.init(document.getElementById("disgiram"));
    myChart.setOption({
      tooltip: {},
      grid: {
        top: "20px",
        left: "20px",
        right: "20px",
        containLabel: true,
      },
      xAxis: {
        data: datas.xAxisData,
        name: "",
        axisLine: {
          onZero: true,
          show: true,
          lineStyle: {
            color: ["rgba(55, 52, 78, 0.08)"],
            width: 0.5,
            type: "solid",
          },
        },
        splitLine: { show: false },
        splitArea: { show: false },
        axisTick: {
          // y轴刻度线
          show: false,
        },
        axisLabel: {
          formatter: "{value}",
          textStyle: {
            fontSize: 12,
          },
          color: "rgba(55, 52, 78, 0.85)",
        },
      },
      yAxis: {
        splitLine: {
          show: true,
          lineStyle: {
            color: ["rgba(55, 52, 78, 0.08)"],
            width: 1,
            type: "solid",
          },
        },
        splitNumber: 4,
        axisLabel: {
          formatter: (value: any) => `${numer(value)}`,
          textStyle: {
            fontSize: 12,
          },
          color: "rgba(55, 52, 78, 0.85)",
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          // y轴刻度线
          show: false,
        },
      },
      series: [
        {
          name: "PNL",
          type: "bar",
          // barWidth: diff <= 7 ? 26 : 18,
          data: datas.data,
        },
      ],
    });
  }, [datas]);

  useEffect(() => {
    onChart();
    // eslint-disable-next-line
  }, [props.date]);

  const onChart = async () => {
    const res = await getDailyPnl(props.date);
    if (res.code === "0000") {
      let result: any = res.data;
      const diff = moment(props.date.end).diff(moment(props.date.start), "days");
      const times: any = [];
      let datas: any = [];
      for (let i = diff; i >= 0; i--) {
        times.push(moment(props.date.start).add(i, "days").format("YYYY-MM-DD"));
      }
      times.forEach((item: any) => {
        const arr = res.data.filter((r: any) => item === r.snapshotDate && times.includes(r.snapshotDate));
        if (arr.length) {
          datas.push({
            value: arr[0].pnlChanges,
            time: moment(item).valueOf(),
          });
        } else {
          datas.push({
            value: 0,
            time: moment(item).valueOf(),
          });
        }
      });
      result = datas.sort((a: any, b: any) => a.time - b.time);
      datas = result.map((item: any) => ({
        value: item.value,
        itemStyle: {
          color: item.value < 0 ? "#F73461" : "#2EBD85",
        },
      }));
      setDatas({
        data: datas,
        xAxisData: result.map((item: any) => moment(item.time).format("MM-DD")),
      });
    }
  };
  return (
    <div className="disgiram-pnl">
      <div className="top">
        {props.intl.formatMessage({ id: "DailyPNL" })}{" "}
        <Tooltip color="white" getPopupContainer={(r) => r} title={props.intl.formatMessage({ id: "TodayPnl" })}>
          <ExclamationCircleOutlined />
        </Tooltip>
        {!props.hide ? (
          <span className="avbl-hide">******</span>
        ) : Number(props.pnl.todayPnl) !== 0 ? (
          <span className={Number(props.pnl.todayPnl) <= 0 ? "avbl-rose" : "avbl"}>
            {(Number(props.pnl.todayPnl) > 0 ? "+$" : "-$") + toThousands(Math.abs(Number(props.pnl.todayPnl)))}
          </span>
        ) : (
          <span style={{ marginLeft: "12px", fontFamily: "number" }}>0</span>
        )}
      </div>
      <div id="disgiram" style={{ width: "100%", height: 205 }}></div>;
    </div>
  );
};

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DisgirmPnl));
