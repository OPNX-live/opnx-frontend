export interface IKycData {
  countryOfResidence: string;
  dateOfBirth: number;
  kycInfo: IkycInfo[];
  lastName: string;
  level: string;
  middleName: string;
  nationality: string;
  salutation: string;
  superName: string;
  userType: string;
  idExpiryDate: string;
  idSerialNumber: string;
  idType: string;
}
export interface IKyc3Data {
  phoneNumber: any;
  idInvalid: boolean;
  basicInvalid: boolean;
  idStatus: any | null;
  individualBasicInfo: {
    country: string;
    birthDate: number;
    kycInfo: IkycInfo[];
    lastName: string;
    middleName: string;
    nationality: string;
    salutation: string;
    surname: string;
    userType: string;
    idExpiryDate: string;
    idSerialNumber: string;
    idType: string;
  };
  registeredAddress: {
    city: string;
    country: string;
    postalCode: number;
    street: string;
    flatOrRoom: string;
    state: string;
  };
  kycType: string;
  containAnAddress: boolean;
  employmentStatus: string;
  industry: string;
  otherIndustry: string;
  level: number;
  proofOfAddress: string;
  purpose: string;
  otherPurpose: string;
  savingAndInvestments: string;
  selfie: string;
  sourceOfFunds: string;
  otherSourceOfFunds: string;
  uploadId: { front: string; back: string };
  status: string;
  notes: string;
}
export interface IkycInfo {
  level: string;
  note: string;
  status: string;
  updateTime: number;
  updater: string;
  amount: number;
}
