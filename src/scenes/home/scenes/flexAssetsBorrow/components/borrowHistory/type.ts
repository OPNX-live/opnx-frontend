import prev from '../../../../../../assets/image/pagination-left.svg';
import next from '../../../../../../assets/image/pagination-right.svg';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
export { prev, next, Date };
export interface IBorrowState {
  historyData: any;
  historytime: string[];
  typeSelect: string | undefined;
  historyNum: number;
  historySize: number;
  historyTotal: number;
  loading: number;
  accounts: any;
  activeKey: string;
  activeAccountKey: string;
  borrows: any;
  tradeAndFailed: any;
  visible: boolean;
  borrowLoading: boolean;
  historyLoading: boolean;
  activeRow: any;
}
export interface IBorrowProps {}

export interface IBorrowTableData {
  pageNum: number;
  pageSize: number;
  searchParams: {
    collateral: string;
    type: string;
    startDate: string;
    endDate: string;
  };
}
export interface ISpotData {
  contract: string;
  fee: string;
  filled: string;
  price: string;
  side: string;
  time: string;
  total: string;
  id: string;
  position: string;
}
export interface IFundingPaymeny {
  contract: string | null;
  id: number;
  payment: string;
  position: string | null;
  rate: string | null;
  time: string;
}
export function checkNumber(item: string) {
  if (item.split('.')[1] === '0000') {
    return item.split('.')[0];
  }
  return item;
}
