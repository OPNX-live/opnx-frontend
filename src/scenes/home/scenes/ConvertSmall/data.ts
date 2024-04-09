import Decimal from "decimal.js";
import { DecimalNum } from "utils";

export const filterData = (f: any[], b: any[]) => {
  if (!f || !f.length) {
    return [];
  }
  const data: any[] = [];
  f.forEach((i) => {
    const balance = b.find((j) => j.coin === i.instrument);
    if (balance) {
      data.push({
        ...i,
        USDvalue: new Decimal(
          DecimalNum(
            DecimalNum(balance.value, balance.totalBalance, "div"),
            balance.availableBalance,
            "mul"
          )
        ).toFixed(),
      });
    }
  });
  return data;
};
export const reduceValue = (f: any, type: string, key: string[]) => {
  if (!f.length || !key.length) {
    return 0;
  }
  const data: any = [];
  f.forEach((i: any) => {
    const c = key.find((j) => i.instrument === j);
    if (c) {
      data.push(i);
    }
  });
  if (data.length === 1) {
    return data[0][type];
  }
  if (data.length === 0) {
    return 0;
  }
  let total = 0;
  data.forEach((i: any) => {
    total = DecimalNum(total, Number(i[type]), "add");
  });
  return new Decimal(total).toFixed();
};
