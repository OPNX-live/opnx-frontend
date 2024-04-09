import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
export { prev, next, Date };
export interface IRewardPropsInput {
  //   type: string;
  // exportsBack:(e:IRewardSearchParams)=>void
}
export interface IRewardStates {
  initDate: any;
  visible: boolean;
  markets: string[];
  result: IRewardResult;
  params: IRewardParams;
  loading: 0 | 1;
}
export interface IRewardParams extends IParams {
  searchParams: IRewardSearchParams;
}
export interface IRewardSearchParams {
  historyType: string;
  startDate: string;
  endDate: string;
  accountId: string;
}
export interface IRewardResult {
  total: number;
  data: [IRewardOutput[]];
}
export interface IRewardOutput {
  id: number;
  contract: string;
  fee: string;
  filled: string;
  leg1: string;
  leg2: string;
  price: string;
  side: string;
  time: string;
  total: string;
}
