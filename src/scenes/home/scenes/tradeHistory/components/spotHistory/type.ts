import prev from "../../../../../../assets/image/pagination-left.svg";
import next from "../../../../../../assets/image/pagination-right.svg";
import { ReactComponent as Date } from "assets/image/date-lint.svg";
import { ISpreadSearchParams } from "../spread/type";
export { prev, next, Date };
export const SpotHistoryState = {
  spotData: [],
  spotTime: [],
  Market: [],
  spotRest: false,
  pageNum: 1,
  pageSize: 10,
  total: 0,
  loading: 0,
  typeSelect: [],
  SpotType: [],
  marketsType: [],
};
export interface SpotState {
  spotData: ISpotData[];
  spotTime: string[];
  Market: string[];
  spotRest: boolean;
  pageNum: number;
  pageSize: number;
  total: number;
  loading: number;
  typeSelect: string[];
  SpotType: string[];
  marketsType: { name: string; value: string }[];
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
export interface ISpotProps {
  markets: string[];
  exportsBack: (e: ISpreadSearchParams) => void;
}
interface ISpotData {
  contract: string;
  fee: string;
  filled: string;
  price: string;
  side: string;
  time: string;
  total: string;
  id: number;
}
