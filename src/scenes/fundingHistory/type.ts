
export type FundingHistoryObject = {
  id: number;
  instrumentId: string;
  longDelivery: number;
  shortDelivery: number;
  netDelivery: string;
  auctionPrice?: number;
  auctionTime?: number;
  fundingRate?: number;
  auctionStatus?: string;
  created: string;
  lastUpdated: string;
};
