import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
export { prev, next, Date };
export interface IoUSDPropsInput {
  //   type: string;
  //   exportsBack: (e: IoUSDSearchParams) => void;
}
export interface IoUSDStates {
  type: string;
  result: IoUSDResult;
  params: IoUSDParams;
  loading: 0 | 1;
  lendPool:{[key:string]:string}
}
export interface IoUSDParams extends IParams {
  searchParams: any;
}
export interface IoUSDSearchParams {
  type: string;
  startDate: string;
  endDate: string;
  accountId?: string;
  collateral: string;
  poolId: string;
}
export interface IoUSDResult {
  total: number;
  data: IoUSDOutput[];
}
export interface IoUSDOutput {
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
