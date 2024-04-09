import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
export { prev, next, Date };
export interface IRepoPropsInput {
  markets: string[];
  exportsBack: (e: IRepoSearchParams) => void;
}
export interface IRepoStates {
  markets: string[];
  result: IRepoResult;
  params: IRepoParams;
  loading: 0 | 1;
  marketsType: { name: string; value: string }[];
}
export interface IRepoParams extends IParams {
  searchParams: IRepoSearchParams;
}
export interface IRepoSearchParams {
  contract: string[];
  startDate: string;
  endDate: string;
  type: string[];
}
export interface IRepoResult {
  total: number;
  data: IRepoOutput[];
}
export interface IRepoOutput {
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
