export const typeSource = (value: number) => {
  const data = {
    0: "Trade",
    2: "Borrow",
    10: "AMM",
    102: "Borrow Liquidation",
    103: "Liquidation",
    101: "Auto Borrow",
    111: "Auto Repay",
    108: "Auto Deleveraging",
    22: "Delivery",
  } as { [key: number]: string };
  return data[value] || "Trade";
};
