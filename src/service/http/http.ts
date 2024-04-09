import { post, fetch, fetchMoonpay } from "./axios";
import axios from "axios";
import { USER_INFO_URL } from "service/config";
import isAddress from "utils/isAddress";
import { checkMetamaskAddress } from "utils/checkMetamaskAddress";
import { downloadFile } from "utils/downLoadFile";

const channelHeader =
  process.env.NODE_ENV === "development"
    ? { channel: "MOBILE" }
    : { channel: "COMPUTER" };
export function sendMail(
  emial: string,
  type: string,
  loginName: string,
  token?: string,
  action?: string
) {
  const params: any = {
    email: emial,
    emailType: type,
    token,
    action,
  };
  if (loginName) {
    params["loginName"] = loginName;
  }
  return post(USER_INFO_URL.SEND_MAIL, params, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function reSendMail(
  emial: string,
  type: string,
  token?: string,
  action?: string
) {
  return post(
    USER_INFO_URL.RESEND_MAIL,
    { email: emial, emailType: type },
    () => {},
    {
      headers: {
        "g-recaptcha-response": token,
        "x-device-type": "web",
        "x-user-action": action,
      },
    }
  );
}

export async function registerAddress(address: string) {}
export async function getNonce(address: string) {
  const nonceResponse = await fetch(
    USER_INFO_URL.WALLET_AUTH_NONCE + `?publicAddress=${address}`
  );
  const { code, data } = nonceResponse;
  if ("0000".includes(code)) {
    // console.log("data: ", data);
    return data;
  }
  return null;
}

//   BIND_METAMASK_EMAIL VALIDATE_BIND_ADDRESS BIND_METAMASK
export async function getBindAddress(address: string) {
  if (!address || !isAddress(address)) {
    return null;
  }
  const response = await fetch(
    USER_INFO_URL.VALIDATE_BIND_ADDRESS + `/${address}`
  );
  const { code, data } = response;
  if ("0000".includes(code)) {
    return data;
  }
  return null;
}

export async function bindMetaMaskAddress(address: string) {
  const response = await post(USER_INFO_URL.BIND_METAMASK, {
    publicAddress: address,
  });
  const { code, success } = response;
  if ("0000".includes(code)) {
    return success;
  }
  return null;
}

export async function bindMetaMaskEmail(
  email: string,
  password: string,
  confirmPassword: string
) {
  const response = await post(
    USER_INFO_URL.BIND_METAMASK_EMAIL,
    { email, password, confirmPassword },
    () => {},
    { headers: { ...channelHeader } }
  );
  const { code } = response;
  if ("0000".includes(code)) {
    return response;
  }
  return null;
}

export async function validateEmailIsBindMetaMask(address: string) {
  if (!address || !isAddress(address)) {
    return null;
  }
  const response = await fetch(
    USER_INFO_URL.VALIDATE_METAMASK_EMAIL_BIND_ADDRESS + `/${address}`
  );
  const { code, data } = response;
  if ("0000".includes(code)) {
    return data;
  }
  return null;
}

export async function verifySignature(signedMessage: ISignatureVerification) {
  const response = await post(
    USER_INFO_URL.WALLET_AUTH,
    signedMessage,
    () => {},
    { headers: channelHeader }
  );
  const { code, data } = response;
  if ("0000".includes(code)) {
    return data;
  }
  return null;
}
export function registerRequest(
  email: string,
  password: string,
  confirmPassword: string,
  shareAccountId: string | null
) {
  return post(USER_INFO_URL.USER_REGISTER, {
    email,
    password,
    confirmPassword,
    shareAccountId,
  });
}
export function geetestInit(email: string) {
  return post(USER_INFO_URL.GEETEST_INIT, { email, clientType: "web" });
}
export function geetestValidate(data: any) {
  return post(USER_INFO_URL.GEETEST_VALIDATE, {
    email: data.email,
    geetest_challenge: data.geetest_challenge,
    geetest_validate: data.geetest_validate,
    geetest_seccode: data.geetest_seccode,
    clientType: data.clientType,
    geetestType: data.geetestType,
  });
}
export function confirmMail(data: any, token?: string, action?: string) {
  return post(USER_INFO_URL.CONFIRM_MAIL, data, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function addAccout(
  userName: string,
  accountType: string,
  tradingTypes: string,
  token?: string,
  action?: string
) {
  return post(
    USER_INFO_URL.ADD_ACCOUT,
    {
      userName,
      accountType,
      tradingTypes,
    },
    () => {},
    {
      headers: {
        "g-recaptcha-response": token,
        "x-device-type": "web",
        "x-user-action": action,
      },
    }
  );
}
export function accoutList(pageNum: number, pageSize: number) {
  return post(
    USER_INFO_URL.ACCOUT_LIST,
    {
      pageNum,
      pageSize,
    },
    () => {}
  );
}
export function changeAccout(data: any, token?: string, action?: string) {
  return post(USER_INFO_URL.CHNAGE_ACCOUT_MESSAGE, data, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function accoutDelete(key: number) {
  return post(USER_INFO_URL.ACCOUT_DELETE + key, {}, () => {}, {});
}

export function login(data: any, tfa?: string) {
  const params: any = { ...channelHeader };
  if (tfa) {
    params["tfa-code"] = tfa;
  }
  return post(USER_INFO_URL.LOGIN, data, () => {}, {
    headers: params,
  });
}

export function restPassword(data: any) {
  return post(USER_INFO_URL.REST_PASSWORD, data);
}

export function subAccountList() {
  return fetch(USER_INFO_URL.SUB_ACCOUNT_LIST, {}, () => {}, {});
}

export function getApiKeys(data: any) {
  return post(USER_INFO_URL.GET_APIKEY, data, () => {}, {});
}

export function createApiKey(
  data: any,
  code?: string,
  emailCode?: string,
  token?: string,
  action?: string
) {
  return post(USER_INFO_URL.CREATE_APIKEY, data, () => {}, {
    headers: {
      "tfa-code": code,
      "email-code": emailCode,
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}

export function allAccounts() {
  return fetch(USER_INFO_URL.ALL_ACCOUNTS, {}, () => {}, {});
}

export function delApiKey(cfAPIId: string) {
  return post(USER_INFO_URL.DEL_APIKEY + `/${cfAPIId}`, {}, () => {}, {});
}

export function changePermission(data: any, code?: string) {
  return post(USER_INFO_URL.CHANGE_PERMISSION, data, () => {}, {
    headers: { "tfa-code": code },
  });
}
export function AllLogin(pageNum: number, pageSize: number) {
  return post(USER_INFO_URL.ALL_LOGIN, { pageNum, pageSize }, () => {});
}
export function BindDefault(data: { accountId: string; loginId: string }) {
  return fetch(USER_INFO_URL.BIND_DEFAULT, {}, () => {}, {
    headers: {
      accountId: data.accountId,
      loginId: data.loginId,
    },
  });
}
export function CreateLoginAccount(
  data: {
    userName: string;
    password: string;
    canTrade: boolean;
    canWithdraw: boolean;
    accountId: string[];
  },
  tfa?: string,
  token?: string,
  action?: string
) {
  return post(USER_INFO_URL.CREATE_LOGIN_ACCOUNT, data, () => {}, {
    headers: {
      "tfa-code": tfa,
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function getSubAccount(loginId?: string) {
  return fetch(USER_INFO_URL.GET_SUB_ACCOUNT, { loginId });
}
export function AddBind(
  data: {
    accountID: string;
    canTrade: boolean;
    canWithdraw: boolean;
    subAccountId: string[];
  },
  tfa?: string
) {
  return post(USER_INFO_URL.ADD_BIND, data, () => {}, {
    headers: { "tfa-code": tfa },
  });
}
export function isFreeze(data: {
  loginId: string;
  status: "ACTIVE" | "FREEZE";
}) {
  return post(USER_INFO_URL.IS_FREEZE, data, () => {});
}
export function MenaRestPassword(
  data: { loginId: string; password: string },
  token?: string,
  action?: string
) {
  return post(USER_INFO_URL.MANAGEMENT_REST_PASSWORD, data, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function deleteLoginAccount(loginId: string) {
  loginId = loginId.replace("/", "%2F");
  return fetch(USER_INFO_URL.DELETE_LOGIN_ACCOUNT + `${loginId}`, {}, () => {});
}
export function UpdatePermissions(
  data: {
    accountId: string;
    canTrade: boolean;
    canWithdraw: boolean;
    subAccountId: string;
  },
  tfa?: string
) {
  return post(USER_INFO_URL.UPDATE_PERMISSION, data, () => {}, {
    headers: { "tfa-code": tfa },
  });
}
export function UnBind(data: { accountId: string; subAccountId: string }) {
  return post(USER_INFO_URL.UN_BIND, data, () => {});
}

export function SwitchAccout(accountId: string) {
  return fetch(USER_INFO_URL.SWITCH_ACCOUT, {}, () => {}, {
    headers: {
      accountId,
    },
  });
}

export function TotalApi() {
  return fetch(USER_INFO_URL.TOTAL_API_KEY, {}, () => {}, {});
}
export async function UserData(token?: string, action?: string) {
  // console.log(USER_INFO_URL.USER_DATA);
  const response = await fetch(USER_INFO_URL.USER_DATA, {}, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
  try {
    checkMetamaskAddress(response);
  } catch (err) {}
  return response;
}
export function GetSubAccount(pageNum: number, pageSize: number) {
  return post(USER_INFO_URL.DATA_GET_SUBACCOUNT, { pageNum, pageSize });
}
export function homeBalanceChar() {
  return fetch(USER_INFO_URL.BLANCES_CHART);
}

export function changeSecurity(data: any) {
  return post(USER_INFO_URL.SECURITY_TFA, data, () => {});
}

export function securtityList(data: any) {
  return post(USER_INFO_URL.SECURITY_LIST, data, () => {});
}
export function closeTfa(tfaCode: string, value?: string) {
  return post(USER_INFO_URL.DISABLE_TFA, { tfaCode, enable: false }, () => {}, {
    headers: { "email-code": value },
  });
}
export function tabSubAccount() {
  return fetch(USER_INFO_URL.TAB_SUBACCOUNT);
}
export function InquireBalance(accountId: string) {
  return post(USER_INFO_URL.ESTIMATED_BALANCE, { accountId });
}
export function userBlance(accountId: string) {
  return post(USER_INFO_URL.USER_BALANCE, { accountId });
}
export function userPosition(accountId: string) {
  return fetch(USER_INFO_URL.USER_POSITION + accountId);
}
export function twoFaBind<T>(
  params: T,
  code: string,
  value?: string,
  token?: string,
  action?: string
) {
  return post(USER_INFO_URL.TFA_BIND, params, () => {}, {
    headers: {
      "tfa-code": code,
      "email-code": value,
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}

export function twoFaValid<T>(
  params: T,
  code: string,
  emailCode?: string,
  token?: string,
  action?: string
) {
  console.log(code);
  return post(USER_INFO_URL.TFA_VALID, params, () => {}, {
    headers: {
      "tfa-code": code,
      "email-code": emailCode,
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function tfaLogin(tfa: string, token?: string, value?: string) {
  return fetch(USER_INFO_URL.LOGIN_TFA, {}, () => {}, {
    headers: {
      ...channelHeader,
      "tfa-code": tfa,
      "xOPNXtoken": token,
      "email-code": value,
    },
  });
}
export function tradFee() {
  return fetch(USER_INFO_URL.TRAD_FEE);
}

export function tradLevel() {
  return fetch(USER_INFO_URL.TRAD_LEVEL);
}

export function accsGet(matchedType: string, startTime: string) {
  return post(USER_INFO_URL.ACCS_GET, {
    matchedType,
    startTime,
  });
}

export function accsGpday(pageNum: number, pageSize: number) {
  return post(USER_INFO_URL.ACCS_GPDAY, { pageNum, pageSize });
}
// 已废弃
// export function restPasswordType(email: string) {
//   return fetch(USER_INFO_URL.REST_PASSWORD_AUTH, {}, () => { }, {
//     headers: { email },
//   });
// }

export function getTransferAccount() {
  return fetch(USER_INFO_URL.TRANSFER_ACCOUNT);
}

export function getCoin(from: string, to: string) {
  return fetch(`${USER_INFO_URL.TRANSFER_COIN}/${from}/${to}`);
}

export function getAllCoin() {
  return fetch(`${USER_INFO_URL.ALL_COIN_LIST}`);
}
export function getTransferBalances(accountId: string) {
  return fetch(`${USER_INFO_URL.TRANSFER_BALANCES + accountId}`);
}
export function makeTransfer<T>(params: T) {
  return post(USER_INFO_URL.TRANSFER_SUBMIT, params);
}
export function allCoin(url: string) {
  return fetch(USER_INFO_URL.ALL_COIN + url);
}
export function coinBalance<T>(data: T) {
  return post(USER_INFO_URL.COIN_BALANCE, data);
}
export function getDepositHistories<T>(params: T) {
  return post(USER_INFO_URL.DIPOSIT_HISTORIES, params);
}
export function SevenHistory(startDate: string, endDate: string) {
  // 充币7天历史记录
  return post(USER_INFO_URL.SEVEN_HISTORY, { startDate, endDate });
}

export function getTransfersHistories<T>(params: T) {
  return post(USER_INFO_URL.TRANSFERS_HISTORIES, params);
}
export function transferHistory(startDate: string, endDate: string) {
  // 7天划转记录
  return post(USER_INFO_URL.TRANSFER_HISTORY, { startDate, endDate });
}
export function exportDeposit(
  startDate: string,
  endDate: string,
  instruments?: string[] | [],
  statuses?: string[] | []
) {
  return post(
    USER_INFO_URL.EXPORT_DEPOSIT,
    {
      startDate,
      endDate,
      instruments,
      statuses,
    },
    () => {},
    { responseType: "blob" }
  );
}
// 这个时间是反的！！！
export function exportTransfers(
  startDate: string,
  endDate: string,
  instruments?: string[] | [],
  statuses?: string[] | []
) {
  return post(
    USER_INFO_URL.EXPORT_TRANSFERS,
    {
      startDate,
      endDate,
      instruments,
      statuses,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportWithdraw(
  startDate: string,
  endDate: string,
  instruments?: string[] | [],
  statuses?: string[] | []
) {
  return post(
    USER_INFO_URL.EXPORT_WITHDRAW,
    {
      startDate,
      endDate,
      instruments,
      statuses,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportDelivery(
  startDate: string,
  endDate: string,
  instrumentIdList: string[] | []
) {
  return post(
    USER_INFO_URL.EXPORT_DELIVER,
    {
      startDate,
      endDate,
      instrumentIdList,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportTransaction(
  startDate: string,
  endDate: string,
  contract?: string[] | [],
  type?: string[] | []
) {
  return post(
    USER_INFO_URL.EXPORT_TRANSACTION,
    {
      startDate,
      endDate,
      contract,
      type,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportFlexConvert(startDate: string, endDate: string) {
  return post(
    USER_INFO_URL.EXPORT_FLEXCONVERT,
    {
      startDate,
      endDate,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportMoonpay(
  startDate: string,
  endDate: string,
  statuses: string
) {
  return fetch(
    USER_INFO_URL.EXPORT_MOONPAY +
      `?start=${startDate}&end=${endDate}&status=${statuses}`,
    {},
    () => {},
    { responseType: "blob" }
  );
}
export function exportAllExcel(
  startDate: string,
  endDate: string,
  httpType: "EXPORT_FUTURE" | "EXPORT_SPOT" | "EXPORT_REPO" | "EXPORT_SPREAD",
  contract?: string[] | [],
  type?: string[] | []
) {
  return post(
    USER_INFO_URL[httpType],
    {
      startDate,
      endDate,
      contract,
      type,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportAssetExcel(
  startDate: string,
  endDate: string,
  historyType: string
) {
  return post(
    USER_INFO_URL.EXPORT_ASSET_HISTORY,
    {
      startDate,
      endDate,
      historyType,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function exportRepayExcel(
  startDate: string,
  endDate: string,
  historyType: string,
  instrument: string
) {
  return post(
    USER_INFO_URL.EXPORT_REPAY,
    {
      startDate,
      endDate,
      historyType,
      instrument,
    },
    () => {},
    { responseType: "blob" }
  );
}
export function withdrawHistory(startDate: string, endDate: string) {
  // 7天提币记录
  return post(USER_INFO_URL.WITHDRAW_HISTORY, { startDate, endDate });
}
export function getWithdrawAddress<T>(data: T) {
  return post(USER_INFO_URL.GET_WITHDRAW_ADDRESS, data);
}
export function getWithdrawHistories<T>(params: T) {
  return post(USER_INFO_URL.HISTORIES_LIST, params);
}
export function saveWithdrawAddress<T>(params: T) {
  return post(USER_INFO_URL.SAVE_ADDRESS, params);
}
export function saveAddress<T>(params: T) {
  return post(USER_INFO_URL.SAVE_ADDRESS, params);
}
export function havePosition(accountId?: string) {
  return post(USER_INFO_URL.HAVE_POSITION, {
    accountId,
  });
}
export function submitWithdraw<T>(params: T, tfa: string) {
  return post(USER_INFO_URL.SUBMIT_WITHDRAW, params, () => {}, {
    headers: { "tfa-code": tfa },
  });
}

export function getAddress() {
  return fetch(USER_INFO_URL.GET_ADDRESS);
}

export function deleteAddress(params: any) {
  return post(USER_INFO_URL.DELETE_ADDRESS, params);
}
export function getWithdrawFee(url: string) {
  return fetch(USER_INFO_URL.WITHDRAW_FEE + url, {});
}
export function loginOut() {
  return fetch(USER_INFO_URL.LOGIN_OUT);
}
export function getBanlance(url: string) {
  return fetch(USER_INFO_URL.GET_BALANCE + url);
}
export function withdrawLimit() {
  return fetch(USER_INFO_URL.WITHDRAW_LIMIT);
}
export function checkAddress<T>(params: T) {
  return post(USER_INFO_URL.CHECK_ADDRESS, params);
}
export function getDepositBanlance(url: string) {
  return fetch(USER_INFO_URL.GET_DEPOSIT_BALANCE + url);
}
export function getDeliversList(params: any) {
  return post(USER_INFO_URL.DELIVERS_LIST, params);
}
export function getMarketsType() {
  return fetch(USER_INFO_URL.MARKETS_TYPE);
}
export function geetestType(param: any) {
  return fetch(USER_INFO_URL.GEETEST_TYPE + `/${param}`);
}
export function spotHistory<T>(params: T) {
  return post(USER_INFO_URL.SPOT_HISTORY, params);
}
export function getTransactionHistories(params: any) {
  return post(USER_INFO_URL.TRANSACTION_HISTORIES, params);
}
export function getSpreadHistory<T>(params: T) {
  return post(USER_INFO_URL.GET_SPREAD, params);
}
export function getRepoHistory<T>(params: T) {
  return post(USER_INFO_URL.GET_REPO, params);
}
export function futuresHistory<T>(params: T) {
  return post(USER_INFO_URL.FUTURES_HISTORY, params);
}
export function fundingHistory<T>(params: T) {
  return post(USER_INFO_URL.FUNDING_HISTORY, params);
}
export function getMarkets() {
  return fetch(USER_INFO_URL.GET_MARKETS);
}
export function getMarketAll() {
  return fetch(USER_INFO_URL.GET_MARKETS_ALL);
}

export function futuresTypes() {
  return fetch(USER_INFO_URL.FUTURES_TYPES);
}
export function transactionTypes() {
  return fetch(USER_INFO_URL.TRANSACTION_TYPE);
}

export function switchWhiteList(
  isSwith: boolean,
  tfa: string,
  emailCode: string
) {
  return fetch(
    USER_INFO_URL.SWITCH_WHITELIST + isSwith + "/white/list",
    {},
    () => {},
    {
      headers: { "tfa-code": tfa, "email-code": emailCode },
    }
  );
}

export function addWhiteAddress(
  params: string[],
  tfa: string,
  emailCode: string
) {
  return post(USER_INFO_URL.ADD_WHITE_ADDRESS, params, () => {}, {
    headers: { "tfa-code": tfa, "email-code": emailCode },
  });
}
export function removeWhiteAddress<T>(params: T) {
  return post(USER_INFO_URL.REMOVE_WHITE_ADDRESS, params);
}
export function fundingHistoryPage(
  pageNum: number,
  pageSize: number,
  searchParams: { instrumentId?: string; startDate: string; endDate: string }
) {
  return post(USER_INFO_URL.FUNDING_HISTORY_PAGE, {
    pageNum,
    pageSize,
    searchParams,
  });
}

// 检验参数合法性
export function getAuthorize<T>(params: T) {
  return fetch(USER_INFO_URL.GET_AUTHORIZE, params, () => {}, {
    withCredentials: true,
  });
}

// 授权动作，表单提交
// export async function authorize<T>(params: T) {
//   let form = new FormData();
//   form.set("user_oauth_approval", "true");
//   form.set("scope.cf_options", "true");
//   return post(USER_INFO_URL.GET_AUTHORIZE, form, () => { }, {
//     withCredentials: true,
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded;;charset=utf-8",
//     },
//     params: params,
//   })
// }
// 授权动作，表单提交
export async function authorize<T>(params: T) {
  try {
    const form = new FormData();
    form.set("user_oauth_approval", "true");
    form.set("scope.cf_options", "true");
    const response = await axios.post(
      process.env.REACT_APP_HTTP_URL + USER_INFO_URL.GET_AUTHORIZE,
      form,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        withCredentials: true,
        params,
        maxRedirects: 0,
        validateStatus(status) {
          return status === 302; // default
        },
      }
    );
    return response;
  } catch (err) {
    return err;
  }
}
export function shareInfo() {
  return fetch(USER_INFO_URL.SHARE_INFO);
}
export function referralList<T>(params: T) {
  return post(USER_INFO_URL.REFERRAL_LIST, params);
}
export function rebates<T>(params: T) {
  return post(USER_INFO_URL.REBATES, params);
}
export function geetestCount<T>(data: T) {
  return post(USER_INFO_URL.GEETST_ACCOUNT, data);
}
export function spotTypes() {
  return fetch(USER_INFO_URL.SPOT_TYPE);
}
export function getVotedInfo() {
  return fetch(USER_INFO_URL.GET_VOTE_COIN);
}
export function getVoted() {
  return fetch(USER_INFO_URL.GET_VOTE_PROFILE);
}
export function getVotedBalance(url: string) {
  return fetch(USER_INFO_URL.GET_VOTE_BALANCE + url);
}
export function submitVoted<T>(data: T) {
  return post(USER_INFO_URL.SUBMIT_VOTED, data);
}
export function getFee<T>(data: T) {
  return post(USER_INFO_URL.GET_FEE, data);
}
export function getFlexAssetHisory<T>(data: T) {
  return post(USER_INFO_URL.GET_FLEXASSET, data);
}

export function getNetwork(url: string) {
  return fetch(USER_INFO_URL.GET_NETWORK + url);
}
export function getHistoryAccounts() {
  return fetch(USER_INFO_URL.GET_HISTORY_ACCOUNT_LIST);
}
export function getBorrowHisory<T>(data: T) {
  return post(USER_INFO_URL.GET_HISTORY_BORROW, data);
}
export function getRepayHisory() {
  return fetch(`${USER_INFO_URL.GET_HISTORY_REPAY}`);
}

export function getBorrowRepayType<T>(data: T) {
  return fetch(`${USER_INFO_URL.GET_BORROW_REPAY_TYPE}/${data}`);
}
export function closeBorrow<T>(data: T) {
  return post(`${USER_INFO_URL.CLOSE_BORROW}/${data}`);
}
export function getSeetingIndex<T>(data: T) {
  return post(USER_INFO_URL.SETTING_INDEX, data);
}
export function getSeetingFutures<T>(data: T) {
  return post(USER_INFO_URL.SETTING_FUTURES, data);
}
export function getMinwithdraw<T>(data: T) {
  return post(USER_INFO_URL.GET_MIN_WITHDRAW, data);
}
export function getKycInfo() {
  return fetch(`${USER_INFO_URL.GET_KYC_INFO}`);
}
export function submitCorporKyc<T>(data: T) {
  return post(USER_INFO_URL.SUBMIT_KYV_CORPORATE, data);
}
export function submitInforKyc<T>(data: T) {
  return post(USER_INFO_URL.SUBMIT_KTC_INDIVIDUAL, data);
}
export function KycUpdate<T>(data: T, authorization: string, type: string) {
  return post(`${USER_INFO_URL.UPDALOAD_KYC}?type=${type}`, data, () => {}, {
    headers: {
      "upload-authorization": authorization,
    },
  });
}
export function getAccuracy() {
  return fetch(`${USER_INFO_URL.GET_ACCCIRACY}`);
}
export function getTodayPnl() {
  return fetch(USER_INFO_URL.GET_TODAY_PNL);
}
export function newWorth<T>(data: T) {
  return post(USER_INFO_URL.NEW_WORTH, data);
}
export function getDailyPnl<T>(data: T) {
  return post(`${USER_INFO_URL.GET_DAILY_PNL}`, data);
}
export function getMarketInfo() {
  return fetch(USER_INFO_URL.GET_MARKET_INFO);
}
export function getCirculatingSupply() {
  return fetch(`${USER_INFO_URL.CIRCULATING_SUPPLY}`);
}
export function getLineSupply<T>(data: T) {
  return post(`${USER_INFO_URL.LINE_SUPPLY}`, data);
}

export function getLineCap<T>(data: T) {
  return post(`${USER_INFO_URL.LINE_CAP}`, data);
}

export function maxWithdraw(coin: string) {
  return fetch(`${USER_INFO_URL.MAX_WITHDRAW}${coin}`);
}
export function getCode(deviceID: string) {
  return fetch(`${USER_INFO_URL.GET_CODE}`, {}, () => {}, {
    headers: {
      "device-id": deviceID,
    },
  });
}
export function qrLogin<T>(data: T) {
  return post(`${USER_INFO_URL.QR_LOGIN_CHECK}`, data);
}

export function getETHGasPrice() {
  return fetch(USER_INFO_URL.ETH_GAS_PRICE);
}

export function usKycDataSubmit<T>(data: T) {
  return post(`${USER_INFO_URL.US_KYC_UPLOAD}`, data, () => {}, {
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
}

export function usKycDataUpdate<T>(data: T) {
  return post(`${USER_INFO_URL.US_KYC_UPDATE}`, data, () => {}, {
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
}

export function getGoogleFiles<T>(data: any) {
  return downloadFile(
    `${USER_INFO_URL.GET_GOOGLE_FIILES}${data.fileId}/${data.imageTail}`,
    "url",
    data.fileName
  );
}

export function tfaRemind(type: string) {
  return fetch(`${USER_INFO_URL.TFA_REMIND}?action=${type}`);
}

export function getAnti() {
  return fetch(`${USER_INFO_URL.GET_ANTI_STATUS}`);
}
export function changeAnti<T>(data: T, tfa: string) {
  return post(`${USER_INFO_URL.CHANGE_ANTI_NAME}`, data, () => {}, {
    headers: { "tfa-code": tfa },
  });
}
export function sendMetamaskBindonfirmMail(
  data: any,
  token?: string,
  action?: string
) {
  return post(USER_INFO_URL.SEND_METAMASK_EMAIL_MAIL, data, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}

export function getRewards(data: any) {
  return post(USER_INFO_URL.FETCH_REWARD, data);
}

export function getReceive(data: string) {
  return fetch(USER_INFO_URL.FETCH_RECEIVE + data);
}
export function getMarket() {
  return fetch(USER_INFO_URL.GET_MARKET);
}
export function getConvertFlex() {
  return fetch(USER_INFO_URL.GET_CONVERT_FLEX);
}
export function convertFlex<T>(data: T) {
  return post(USER_INFO_URL.CONVERT_FLEX, data);
}
export function getConvertFlexHistory<T>(data: T) {
  return post(USER_INFO_URL.GET_CONVERT_FLEX_HISTORY, data);
}

export function getTypeList() {
  return fetch(USER_INFO_URL.GET_TYPE);
}

export function whiteListSendMail(token?: string, action?: string) {
  return fetch(USER_INFO_URL.WHITE_LIST_EMAIL, {}, () => {}, {
    headers: {
      "g-recaptcha-response": token,
      "x-device-type": "web",
      "x-user-action": action,
    },
  });
}
export function allAmm() {
  return fetch(USER_INFO_URL.ALL_AMM);
}

export function getTradeHistories<T>(params: T) {
  return post(USER_INFO_URL.TRADE_HISTORY, params);
}

export function getOpenOrdersHistories(url: string) {
  return fetch(USER_INFO_URL.OPEN_ORDER + url);
}

export function getInterestPaymentHistories<T>(params: T) {
  return post(USER_INFO_URL.INTEREST_PAYMENT, params);
}

export function getTransferHistories<T>(params: T) {
  return post(USER_INFO_URL.TRANSFER_IN_OUT, params);
}

export function getBorrowLiquidation<T>(params: T) {
  return post(USER_INFO_URL.BORROW_LIQUIDATION, params);
}

export function exportAmmTradeHistories(
  startTime: string,
  endTime: string,
  hashToken: string
) {
  return fetch(
    USER_INFO_URL.EXPORT_AMM_TRADE_HISTORY +
      `?startTime=${startTime}&endTime=${endTime}&hashToken=${hashToken}`,
    {},
    () => {},
    { responseType: "blob" }
  );
}

export function exportAmmOpenOrdersHistories(hashToken: string) {
  return fetch(
    USER_INFO_URL.EXPORT_AMM_OPEN_ORDERS + `?hashToken=${hashToken}`,
    {},
    () => {},
    { responseType: "blob" }
  );
}

export function exportAmmInterestPaymentHistories(
  startTime: string,
  endTime: string,
  hashToken: string
) {
  return fetch(
    USER_INFO_URL.EXPORT_AMM_INTEREST_PAYMENT +
      `?startTime=${startTime}&endTime=${endTime}&hashToken=${hashToken}`,
    {},
    () => {},
    { responseType: "blob" }
  );
}
export function getMoonpayDepositAddress() {
  return fetch(USER_INFO_URL.MOONPAY_DEPOSIT_ADDRESS);
}
export function getMoonpayCurrencies(apiKey: string) {
  return fetchMoonpay(
    USER_INFO_URL.GET_MOONPAY_CURRENCIES + `?apiKey=${apiKey}`
  );
}
export function agreeMoonpay() {
  return fetch(USER_INFO_URL.AGREE_MOONPAY);
}
export function allowMoonpay() {
  return fetch(USER_INFO_URL.ALLOW_MOONPAY);
}

export function moonpayHistory(status: string, start: number, end: number) {
  return fetch(
    `${USER_INFO_URL.MOONPAY_HISTORY}?status=${status}&start=${start}&end=${end}`
  );
}
export function exportAmmTransferHistories(
  startTime: string,
  endTime: string,
  hashToken: string
) {
  return fetch(
    USER_INFO_URL.EXPORT_AMM_TRANSFER_IN_OUT +
      `?startTime=${startTime}&endTime=${endTime}&hashToken=${hashToken}`,
    {},
    () => {},
    { responseType: "blob" }
  );
}
export function exportAmmBorrowLiquidation(
  startTime: string,
  endTime: string,
  hashToken: string
) {
  return fetch(
    USER_INFO_URL.EXPORT_AMM_BORROW_LIQUIDATION +
      `?startTime=${startTime}&endTime=${endTime}&hashToken=${hashToken}`,
    {},
    () => {},
    { responseType: "blob" }
  );
}
export function settlementTrades<T>(params: T) {
  return post(USER_INFO_URL.SETTLEMENT_TRADES, params);
}
export function userIsIpUs() {
  return fetch(USER_INFO_URL.IS_USER_IP_US);
}
export function submitTos() {
  return post(USER_INFO_URL.SUBMIT_TOS);
}
export function kycCra(craType: string) {
  return fetch(USER_INFO_URL.KYC3_CRA + craType);
}
export function kyc3Info() {
  return fetch(USER_INFO_URL.KYC3_INFO);
}
export function saveKyc3Info<T>(params: T) {
  return post(USER_INFO_URL.SAVE_KYC3_INFO, params);
}
export function subKyc3Info<T>(params: T) {
  return post(USER_INFO_URL.SUB_KYC3_INFO, params);
}
export function downloadPic<T>(url: string) {
  return fetch(
    USER_INFO_URL.DOWNLOAD_PIC + url,
    () => {},
    () => {},
    {
      responseType: "blob",
    }
  );
}
export function getMarketDetail() {
  return fetch(USER_INFO_URL.GET_MARKET_DETAIL);
}
export function uploadKyc3Pic() {
  return fetch(USER_INFO_URL.UPLOAD_KYC3_PIC);
}
export function getIpBlock() {
  return fetch(USER_INFO_URL.GET_IP_BLOCK);
}
export function getPermissionsRate<T>(data: T) {
  return post(USER_INFO_URL.GET_PERMISSIONS_RATE, data);
}

export function withdrawCoinList() {
  return fetch(USER_INFO_URL.WIHTDRAW_COIN_LIST);
}

export function depositCoinList() {
  return fetch(USER_INFO_URL.DEPOSIT_COIN_LIST);
}
export function googleLogin<T>(params: T) {
  return post(USER_INFO_URL.GOOGLE_LOGIN, params);
}

export function plpFee() {
  return fetch(USER_INFO_URL.PLP_FEE);
}
export function getIdentityLink() {
  return post(USER_INFO_URL.GET_IDENTITY_LINK);
}
export function getVerificationResult<T>(data: T) {
  return post(USER_INFO_URL.GET_VERIFICATION_RESULT, data);
}
export function getSessionKey() {
  return fetch(USER_INFO_URL.GET_SEEION_KEY);
}
export function getSardingVerification() {
  return fetch(USER_INFO_URL.GET_SARDING_VERIFICATION);
}
export function getKycResult() {
  return fetch(USER_INFO_URL.GET_KYC_RESULT);
}
export function getBanner(project: string) {
  return fetch(USER_INFO_URL.GET_BANNER + project);
}
export function getSelectMarket(type: string) {
  return fetch(USER_INFO_URL.GET_SELECT_MARKET + type);
}

export function lendHistory<T>(data: T) {
  return post(USER_INFO_URL.LEND_HISTORY, data);
}

export function borrowHistory<T>(data: T) {
  return post(USER_INFO_URL.BORROW_HISTORY, data);
}

export function getLendPool() {
  return fetch(USER_INFO_URL.LEND_POOL);
}
export function getFundingHistoryExcel<T>(data: T) {
  return post(USER_INFO_URL.GET_FUNDING_HISTORY_EXCEL, data, () => {}, {
    responseType: "blob",
  });
}
export function getOUSDHistory<T extends object>(data: T) {
  return post(USER_INFO_URL.GET_OUSD_HISTORY, data);
}
export function getVaultHistory<T extends object>(data: T) {
  return post(USER_INFO_URL.GET_VAULT_HISTORY, data);
}
