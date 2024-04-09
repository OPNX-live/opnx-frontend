export interface ITwoFaState {
  loading: boolean;
  type: string;
  tFaBindState?: ITwoFaBindState;
  qrCodeData?: ITwoFaQrCodeState;
  validData?: ITwoFaValidDataState;
  validData_youbikey?: ITwoFaValidDataState_YouBiKey;
  visible: boolean;
  Code: string;
  emailCode: string;
}

export interface ITwoFaBindState {
  tfaType: string;
}

export interface ITwoFaQrCodeState {
  qrData: string;
  secret: string;
}

export interface ITwoFaValidDataState {
  tfaCode: string;
  // password: string;
  tfaType: string;
}
export interface ITwoFaValidDataState_YouBiKey {
  tfaType: string;
  otp: string;
  // password: string;
}

export enum EnumTwoFaType {
  "google" = "GOOGLE",
  "authy" = "AUTHY_SECRET",
  "youbike" = "YUBIKEY"
}
