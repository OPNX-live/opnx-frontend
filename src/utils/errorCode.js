import React from "react";
import { intl } from "utils/Language";
export const JOIN_ERROR = `Unable to join competition. Please try again later.`;
export const TRY_AGAIN = "Please try again later";
export const accountTypeError = (userType, accountType) =>
  `Your account type of ${userType} is not compatible with this competition's account requirement (${accountType}).`;
export const LEAVE_ERROR = `Unable to leave competition. Please try again later.`;
export const NAME_LENGTH_ERROR =
  "Handle name is required & must be between 1 and 30 characters";
export const insufficientBalanceError = (depositAmount, depositInstrument) =>
  `You need a minimum of ${depositAmount} ${depositInstrument} to enter this competition`;

function messageError(code) {
  const messageList = {
    "*": intl("*"),
    logOut: "Login expired, please log in again",
    Disconnect: "Network disconnected, please check and try again", // 用户断网（失去链接）
    "0003": "Server is busy, please try again",
    "0002": "User authentication failed, please login again",
    500: "Server is busy, please try again",
    401: "Invalid username or password",
    "0007": "No permission of operation",
    "0004": "Cannot approve uninitialized authorization request.",
    // "05004": "Failed",
    "05001": " Your operation authority is invalid",
    "05006": {
      content: (
        <span>
          {intl("05006")}
          <a href="Mailto:suppor@opnx.com" rel="nofollow noopener noreferrer">
            {" "}
            suppor@opnx.com
          </a>{" "}
          ({code})
        </span>
      ),
    },
    15007: "Account does not exist",
    "05004": "Operation failed, please try again",
    25030: "Invalid Code",
    41003:
      "There are open orders or positions in this account, you can only freeze the account after canceling all transactions",
    41011: "Abnormal Parameters.",
    41006: "Please enter the Email",
    41004: "Please enter a valid email",
    41007: "Requires 8-32 characters, not pure numbers",

    41008: "Please enter the password",
    41009: "Please enter the password",
    45011:
      "Account is not activated, please check the email and click the activation link",
    41012: "Confirm Type cannot be null",
    41013: "Email Type cannot be null",
    41014: "Confirm Value cannot be empty",
    41015: "Confirm Code cannot be empty",
    41016: "Client Type cannot be null",
    41017: "Geetest challenge cannot be null",
    41018: "Geetest validation cannot be null",
    41019: "Geetest seccode cannot be null",
    41020: "user Id cannot be null",
    41021: "Message puzzle verification failed",
    41022: "API ID cannot be null",
    41023: "Account Name cannot be null",
    41001: "This name has been created, please try a new one.",
    41024: "Account Id cannot be null",
    41025: "The subaccount cannot be null",
    41026: "Illegal character entered",
    41005: "The email has been registered",
    45014: "INVALID EMAIL",
    45015: "ACCOUNT ACTIVATED",
    45016: "LINK INVALID",
    45017: "Mail requests are too frequent",
    45004: "Failed to reset",
    45006: "Failed to delete",
    45018: "A confirmation email has been sent",
    45012: "Invalid username or password",
    45013: "Wrong password, please re-enter",
    45019:
      "Account is not activated, please check the email and click on the activation link",
    25007: "This account has been banned",
    45008: "The passwords do not match , please re-enter",
    45020: "The API Key does not exist",
    45021: "The API Key is invalid",
    45022: "The confirmation code is invalide",
    45023: "The Account already exists",
    45024: "The current account is not frozen and cannot be deleted",
    45005: "There is only one sub-account and cannot be unbound",
    45025: "The current account is not the main account",
    45026: "The sub-account is invalid",
    45027: "The API Key is invalid",
    45028: "The current account does not have permission of management",
    40007: "Account switch successful",
    45029: "The login ID is invalid",
    45030: "Failed to send email",
    45031: "The current account is frozen",
    45032: "Invalid account, cannot reset password",
    45033:
      "If you forget sub-account password, please contact the main account administrator",
    45034:
      "This sub account has no authority to trade on current ticket, please switch another sub account or contact customer service",
    45035:
      "The main account does not have a sub-account for trading the current currency pair",
    45036: "Parameter exception: missing parameter",
    25006:
      "The account has been set to Locked and cannot be unfrozen. If you have any questions, please contact customer service",
    35001: "Failed to copy, try again",
    35002:
      "The account risk is too high and this amount cannot be transferred.",
    35003:
      "The account does not have permission to operate. If you have any questions, please contact customer service",
    31001: "The amount exceeds the maximum available balance",
    31002: "Selected date range cannot exceed 3 months",
    31009: "Selected date range cannot exceed 1 weeks",
    35028: "The withdrawal amount cannot exceed 8 digits",
    35029: "Failed to get the balance",
    35030: "Failed to get market price",
    35031: "The withdraw request failed",
    35010: "Deposit address failed to be created",
    35011: "Deposit failed to be processed",
    31004: "Please enter the address",
    31003: "The amount is less than the minimum withdrawal requirement",
    31005: "Please enter the amount ",
    31006: "Errors parameter, missing coin id",
    31007: "Errors parameter, missing account id",
    35012: "The deposit address for this assert has already requested.",
    35013: "There is no free deposit address for selected coin in the pool.",
    35023: "The amount has exceeded your withdrawal limit",
    35024: "The address has been saved and there is no need to save it again.",
    35021: "Withdrawal failed to be processed",
    35022:
      "The account risk is too high to withdraw. You can reduce the withdrawal amount and try again",
    35025: "Can’t withdraw to the same account",
    35026:
      "The withdrawal address format is wrong. Please check the withdrawal address length and character content and try again",
    41010: "Please enter a valid email",
    41027: "Wrong format of IP address ",
    35033: "The address of this account cannot be saved",
    31008: "Enter up to 32 characters",
    25002: "Invalid username or password",
    55001: "No flexearn product offers",
    55002: "Please switch to the main account to create an Earn account",
    35032: "Balance insufficient",
    41002:
      "Requires 8-128 characters, can not be a single character, distinguish uppercase and lowercase letters",
    25011:
      "Your country or region is not in our service area and cannot provide services",
    35034:
      "Wallet API is abnormal, please try again or contact customer service",
    45038:
      "Too many errors have caused the original code to become invalid. Please request a new email.",
    65001: "Please do not click repeatedly",
    25010: "Please open the whitelist first",

    35038:
      "Quick transfer failed, maybe you have pending orders, holding positions or account risk is too high",
    35039: "Amount is not enough to deduct Fee, please re-enter.",
    35040: "Withdraw Fee cannot be empty",
    35035: "The calculation of the withdrawal fee is wrong",
    35036: "Insufficient available balance",
    35037: "The instrument cannot be found",
    "05008": "The Copper account is not operational.",
    35041: "Cannot withdraw to this address, it is in the watchlist.",
    35043: "Suspend withdrawal",
    35044: "Suspend deposit",
    35045: "MEMO format is incorrect",
    25032: "The operation is too frequent, please try again after 10s.",
    45041:
      "There are illegal characters in the password, please use regular characters.",
    35027: "You are not the main account",
    25027:
      "The password is same as the previous one you had, please use a new password",
  };
  if (messageList[code]) {
    // return intl(code);
    return intl(code);
  }
  return `${intl("*")}`;
}

export default messageError;
export { messageError };
