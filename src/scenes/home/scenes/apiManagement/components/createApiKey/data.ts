import CryptoJS from "crypto-js";
const repair = (accountId: string): string => {
  if (accountId.length > 16) {
    return accountId.slice(0, 16);
  } else {
    return repair(accountId + accountId); // accountId不足16位补齐16位
  }
};
export const Decrypt = (word: string, accountId: string) => {
  const key = CryptoJS.enc.Utf8.parse(repair(accountId));
  const decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
};
