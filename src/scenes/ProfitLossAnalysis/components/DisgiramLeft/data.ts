import numeral from 'numeral';
import { toCoinAccuracy, toThousands } from 'utils';
export const numer = (n: string | number) => {
  return numeral(n).format('0.0 a');
};
export const option: any = {
  backgroundColor: '#fff',
  xAxis: {
    type: 'category',
    interval: 'auto',
    textStyle: {
      fontFamily: 'number',
    },
    margin: 10,
    boundaryGap: true,
    // data: [],
    axisLine: {
      show: false,
    },
    axisLabel: {
      formatter: '{value}',
      textStyle: {
        fontSize: 12,
      },
      color: 'rgba(55, 52, 78, 0.85)',
    },
    axisTick: {
      // y轴刻度线
      show: false,
    },
  },
  grid: {
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '10px',
    containLabel: true,
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: true,
      lineStyle: {
        color: ['rgba(55, 52, 78, 0.08)'],
        width: 1,
        type: 'solid',
      },
    },
    axisLabel: {
      formatter: (value: any) => `${numer(value)}`,
      textStyle: {
        fontSize: 12,
      },
      color: 'rgba(55, 52, 78, 0.85)',
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      // y轴刻度线
      show: false,
    },
  },
  visualMap: {
    show: false,
    // lt（小于），gt（大于），lte（小于等于），gte（大于等于）
    pieces: [
      {
        lt: 0,
        color: '#F73461',
      },
      {
        gte: 0,
        lt: 1,
        color: '#2EBD85',
      },
      {
        gte: 1,
        color: '#2EBD85',
      },
    ],
  },
  tooltip: {
    trigger: 'axis',
    formatter: (c: any) => {
      return `<div style=${'font-size:12px'}><div style=${'font-size:12px'}>${
        c[0].axisValue
      }</div><div style="display:flex;align-items: center;"><div style="background:${
        c[0].color
      };width:4px;height:4px;border-radius:50%"></div><span style="margin-left:4px;font-size:12px">$${toThousands(
        toCoinAccuracy(c[0].data, 2)
      )}</span></div></div>`;
    },
    backgroundColor: 'rgba(55, 52, 78, 0.85)',
    borderColor: 'rgba(55, 52, 78, 0.85)',
    borderWidth: 1,
    axisPointer: {
      type: 'cross',
      show: true,
      lineStyle: {
        type: 'dashed',
        // color: "rgba(55, 52, 78, 0.85)",
      },
      label: { show: false },
    },
  },
  series: [
    {
      type: 'line',
      areaStyle: { opacity: '0.1' },
      data: [],
      color: 'red',
      symbolSize: 6,
    },
  ],
};
