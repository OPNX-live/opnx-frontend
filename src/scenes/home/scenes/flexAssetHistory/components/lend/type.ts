import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
export { prev, next, Date };
export interface IMintPropsInput {
  //   type: string;
  //   exportsBack: (e: IMintSearchParams) => void;
}
export interface IMintStates {
  type: string;
  result: IMintResult;
  params: IMintParams;
  loading: 0 | 1;
  lendPool:{[key:string]:string}
}
export interface IMintParams extends IParams {
  searchParams: IMintSearchParams;
}
export interface IMintSearchParams {
  type: string;
  startDate: string;
  endDate: string;
  accountId?: string;
  collateral: string;
  poolId: string;
}
export interface IMintResult {
  total: number;
  data: IMintOutput[];
}
export interface IMintOutput {
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
