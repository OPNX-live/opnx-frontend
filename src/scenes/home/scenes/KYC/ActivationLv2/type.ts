export interface IkycInfo {
  level: string;
  note: string;
  status: string;
  updateTime: number;
  updater: string;
  amount: number;
  ownership: string;
}
export interface IcorpData {
  companyName: string;
  incorporationCountry: string;
  incorporationDate: number;
  incorporationNumber: string;
  level: string;
  kycInfo: IkycInfo[];
  userType: string;
}
export interface Icorp3Data {
  companyName: string;
  basicInvalid: boolean;
  idStatus: any | null;
  kycType: string;
  idInvalid: boolean;
  corporateBasicInfo: {
    companyName: string;
    incorporationCountry: string;
    incorporationDate: number;
    incorporationNumber: string;
  };
  annualRevenue: number;
  companyValue: number;
  contractEmail: string;
  corporateStructure: {
    dateOfBirth: number;
    firstName: string;
    idNumber: number;
    lastName: string;
    middleName: string;
    ownership: string;
  }[];
  directors: {
    dateOfBirth: number;
    firstName: string;
    idNumber: number;
    lastName: string;
    middleName: string;
    position: string;
    ownership: string;
  }[];
  entityType: string;
  otherEntityType: string;
  industry: string;
  otherIndustry: string;
  level: number;
  listedOnExchange: boolean;
  containAnAddress: boolean;
  monthlyDeposit: number;
  monthlyWithdrawal: number;
  natureOfBusiness: string;
  otherTradingNames: string;
  phoneNumber: {
    areaCode: number;
    number: number;
  };
  purpose: string;
  otherPurpose: string;
  registeredAddress: {
    city: string;
    country: string;
    postalCode: number;
    street: string;
    flatOrRoom: string;
    state: string;
  };
  operationAddress: {
    city: string;
    country: string;
    postalCode: number;
    street: string;
    flatOrRoom: string;
    state: string;
  };
  registrationNumber: number;
  regulator: string;
  sameAsOperation: boolean;
  sourceOfFunds: string;
  stockExchangeName: string;
  status: string;
  proofOfAddress: string;
  uploadId: { entityFiles: string[] };
}
