import { intl } from "utils/Language";
export const messageSuccess = (code) => {
  // const messageList = {
  //   "*": "Successful",
  //   "00001": "Succeeded",
  //   30001: "Copy successful",
  //   30002: "Transfer successfully",
  //   30010: "Deposit address is created successfully",
  //   30011: "Deposit is processed successfully",
  //   30021: "Withdrawal is processed successfully",
  //   40001: "Create successfully",
  //   40002: "Unfreeze successfully",
  //   40003: "Delete successfully",
  //   40004: "Bind successfully",
  //   40005: "Unbind successfully",
  //   40006: "Reset successfully",
  //   40007: "Account switch successful",
  //   40008: "Freeze successfully",
  //   40009: "Changed successfully",
  // };

  return messageSuccess[code] ? intl(code) : intl("*Successful");
};
