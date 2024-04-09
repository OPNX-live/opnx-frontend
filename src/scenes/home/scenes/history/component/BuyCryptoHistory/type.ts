export interface IBuyCryptoData {
  id: string;
  transactionId: string;
  transactionType: string; //  transaction_created  transaction_failed  transaction_updated
  cryptoTransactionId: string;
  baseCurrency: string; // 法币
  currency: string; // 购买虚拟币
  baseCurrencyAmount: string; // 法币 购买数量
  quoteCurrencyAmount: string; // 获得虚拟币数量
  feeAmount: string; // moonpay 手续费
  extraFeeAmount: string; //  额外手续费
  networkFeeAmount: string; // 链上手续费
  areFeesIncluded: boolean; // baseCurrencyAmount是否包含feeAmount， extraFeeAmount， networkFeeAmount  true 包含。false  不包含
  walletAddress: string; // 充币地址
  walletAddressTag: string; // 充币memo
  customerId: string; // 用户ID
  externalCustomerId: string; // 对应我们公司的accountId 等前端完成集成后会有 现在是和customerId一样
  cardId: string; // 卡ID
  status: string; // waitingPayment, pending, waitingAuthorization, failed or completed.
  stages: string;
  method: string;
  created: number;
  lastUpdated: number;
}
