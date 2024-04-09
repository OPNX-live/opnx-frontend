export interface IKycData {
  type: string;
  address: string;
  country: string;
  note: string;
  created: string;
  residenceCountry: string;
  googleFiles: [];
  AddressProof: [];
  status: string;
}

export interface IcorpData {
  type: string;
  note: string;
  companyName: string;
  incorporationDate: number;
  googleFiles: [];
  incorporationCountry: string;
  status: string;
  CorporateKYCFile: []

}
export interface IkycInfo {
  note: string;
  status: string;
  updateTime: number;
  updater: string
  amount:number
}

export interface IGoogleFiles {
  fileId: string;
  fileName: string;
  imageTail: string;
}
