import prev from '../../../../../../assets/image/pagination-left.svg';
import next from '../../../../../../assets/image/pagination-right.svg';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
export { prev, next, Date };
dayjs.extend(utc);
export const dayFormat = (endDate: string) => {
  const newD = +endDate;
  const nowDate = dayjs.utc().valueOf();
  const prevDate = dayjs.utc(newD).valueOf();
  let totals: number;
  totals = prevDate - nowDate;
  let isTimer:boolean=false
  if (parseInt(prevDate / 1000 + "") - parseInt(nowDate / 1000 + "") === 0) {
    isTimer=true
  }
  const hours = parseInt(
    "" + (totals % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = parseInt("" + (totals % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = parseInt("" + (totals % (1000 * 60)) / 1000);
  return {
    isTimer,
    // tslint:disable-next-line: no-use-before-declare
    h: addZero(hours + ""),
    // tslint:disable-next-line: no-use-before-declare
    m: addZero(minutes + ""),
    // tslint:disable-next-line: no-use-before-declare
    s: addZero(seconds + ""),
  };
};
const addZero = (data: string) => {
  if (+data > 0) {
    if (+data < 10) {
      return 0 + data;
    }
  } else {
    return "00";
  }
  return data;
};
export interface IRedeemStates {
  markets: string[];
  result: any;
  params: any;
  loading: 0 | 1;
  lendPool:{[key:string]:string}
  times:{
    h:string
    m:string
    s:string
  }
}
export interface IRedeemParams extends IParams {
  searchParams: IRedeemSearchParams;
}
export interface IRedeemSearchParams {
  collateral: string;
  type:string;
  startDate: string;
  endDate: string;
  accountId:string;
  poolId:string
}
export interface IRedeemResult {
  total: number;
  data: IRedeemOutput[];
}
export interface IRedeemOutput {
  accountId: number;
  actionType: string;
  amount: string;
  businessType: string;
  coin: null;
  executionStatus: string;
  id: number;
  lastUpdatedAt: number;
  poolId: number;
  poolType: string;
  requestAt: number;
}
