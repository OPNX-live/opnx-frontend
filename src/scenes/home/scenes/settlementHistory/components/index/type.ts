import prev from '../../../../../../assets/image/pagination-left.svg';
import next from '../../../../../../assets/image/pagination-right.svg';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
export { prev, next, Date };
export interface ISpreadPropsInput {}
export interface ISpreadStates {
  markets: string[];
  result: ISpreadResult;
  params: ISpreadParams;
  loading: 0 | 1;
}
export interface ISpreadParams extends IParams {
  searchParams: ISpreadSearchParams;
}
export interface ISpreadSearchParams {
  contract: string | undefined;
  // type:
  startDate: string;
  endDate: string;
}
export interface ISpreadResult {
  total: number;
  data: ISpreadOutput[];
}
export interface ISpreadOutput {
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
