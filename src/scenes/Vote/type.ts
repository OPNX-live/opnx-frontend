export interface IVote {
  dataTime: IdataTime[];
  widths: number;
  voteData:any;
  proFileData:IProfile[]
  isVoted:boolean,
  balanceList:IBalance[]
  loadingA:boolean
  loadingB:boolean
  visable:boolean
}
export interface IdataTime {
  timeName: string;
  timer: string | number;
}
export interface IData {
  codeA: string;
  codeB: string;
  descriptionA: string;
  descriptionB: string;
  id: number;
  isEnd: boolean;
  prizeAmount: number;
  prizeInstrument: string;
  vfrom: number;
  vto: number;
  voteAQuantity: null | string | number;
  voteBQuantity: null | string | number;
}
export interface IProfile {
  description: string;
  flexQuantityFrom: number;
  flexQuantityTo: number;
  votes: number;
}
export interface IBalance{
  instrumentId: string
  quantity: string|number
  snapshotTime: string|number
}
export const DateTime:{[key:string]:string}={
  "01":"Jan",
  "02":"Feb",
  "03":"Mar",
  "04":"Apr",
  "05":"May",
  "06":"June",
  "07":"July",
  "08":"Aug",
  "09":"Sep",
  "10":"Oct",
  "11":"Nov",
  "12":"Dec"
}
