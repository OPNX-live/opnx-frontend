import prev from 'assets/image/pagination-left.svg';
import next from 'assets/image/pagination-right.svg';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
// import { ISpreadSearchParams } from "../spread/type";
export { prev, next, Date };
export const SpotHistoryState = {
  datas: [],
  columns:[],
  date: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  loading: false,
  status: '',
};
export interface SpotState {
  datas: ISpotData[];
  columns: any;
  date: string[];
  pageNum: number;
  pageSize: number;
  total: number;
  loading: boolean;
  status: string;
}
export interface ISpotTableData {
  pageNum: number;
  pageSize: number;
  searchParams: {
    contract: string[];
    type: string[];
    startDate: string;
    endDate: string;
  };
}
export interface ISpotProps {}
interface ISpotData {
  invitedAccountId: string;
  registerTime: string;
  status: string;
}
