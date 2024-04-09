import { intl } from "utils/Language";
function errorMessage(code: any) {
  const messageList: any = {
    "*": intl("25012"),
    "25012": "The age does not meet terms of service.",
    "25013": "The nationality does not meet terms of service.",
    "25014": "The ID Card does not meet terms of service.",
    "25015": "The Passport  does not meet terms of service.",
    "25016": "The incorporation date is invalid.",
    "25017": "The incorporation country does not meet terms of service.",
    "25022": "The country of residence does not meet the terms of service.",
    "25021": "The validity period is less than 60 days and is not available",
  };
  if (messageList[code]) {
    return intl(code);
  }
  return `${intl("*")} (${code})`;
}

export default errorMessage;
export { errorMessage };

// export const errorMessage: { [key: string]: string } = {
//   '25012': 'The age does not meet terms of service.',
//   '25013': 'The nationality does not meet terms of service.',
//   '25014': 'The ID Card does not meet terms of service.',
//   '25015': 'The Passport  does not meet terms of service.',
//   '25016': 'The incorporation date is invalid.',
//   '25017': 'The incorporation country does not meet terms of service.',
//   '25022': 'The country of residence does not meet the terms of service.',
//   '25021': 'The validity period is less than 60 days and is not available',
//   '*': 'The age does not meet terms of service.',
// };
