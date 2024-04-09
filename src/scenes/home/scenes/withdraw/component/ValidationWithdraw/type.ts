
export  interface IParams {
  withdrawAddress: string;
  amount: string | number;
  instrumentId: string;
  feeLevel:string | null
  fee:string
  network:string
  tag:string
}
export enum EunmTfaType {
  AUTHY_SECRET = "Authy",
  AUTHY_PHONE = "Authy",
  GOOGLE = "GoogleAuth",
  YUBIKEY = "YubiKey",
}
export interface IValidationProps {
  dashboardUserData: IDashboardUserData;
}
export interface IValidationWithdrawProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: (success: string, type?: string) => void;
  address:string;
  amount:string;
  coin:string
  fee:string
  network:string
  tag:string
}