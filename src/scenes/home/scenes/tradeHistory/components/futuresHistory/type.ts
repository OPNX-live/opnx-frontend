import prev from '../../../../../../assets/image/pagination-left.svg';
import next from '../../../../../../assets/image/pagination-right.svg';
import { ReactComponent as Date } from 'assets/image/date-lint.svg';
import { ISpreadSearchParams } from '../spread/type';
export { prev, next, Date };
export const FuturesHistoryState = {
  futuresData: [],
  fundingData: [],
  futurestime: [],
  fundingtime: [],
  Market: [],
  fundingMarket:[],
  futuresType: {},
  fundingRest: false,
  futuresRest: false,
  futuresNum: 1,
  futuresSize: 10,
  fundingNum: 1,
  fundingSize: 10,
  futuresTotal: 0,
  fundingTotal: 0,
  typeSelect: [],
  loading: 0,
  marketsType: [],
};
export interface FuturesState {
  futuresData: any;
  fundingData: any;
  futurestime: string[];
  fundingtime: string[];
  Market: string[];
  fundingMarket:string[]
  futuresType: { [key: string]: string };
  typeSelect: string[];
  futuresNum: number;
  futuresSize: number;
  fundingNum: number;
  fundingSize: number;
  futuresTotal: number;
  fundingTotal: number;
  loading: number;
  marketsType: { name: string; value: string }[];
}
export interface IFuturesProps {
  markets: string[];
  exportsBack: (e: ISpreadSearchParams & { type: string[] }) => void;
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
