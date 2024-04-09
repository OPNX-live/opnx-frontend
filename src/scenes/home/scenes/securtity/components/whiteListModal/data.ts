import { defineMessages } from "react-intl";

export const staticData = {
  OpenWhiteList: defineMessages({
    title: {
      id: "Begin work on whitelisting function",
    },
    btnText: {
      id: "Turn on",
    },
    container: {
      id:
        "After turning on this function, you will only be able to withdraw to whitelisted withdrawal addresses. Are you sure you want to turn it on?",
    },
  }),
  EnableWhiteList: defineMessages({
    title: { id: "Are you sure you want to turn on whitelist?" },
    btnText: { id: "Turn on" },
    container: {
      id:
        "After turning on this function, you will only be able to withdraw to whitelisted withdrawal addresses. Are you sure you want to turn it on?",
    },
  }),
  CloseWhiteList: defineMessages({
    title: { id: "Are you sure you want to turn off whitelist?" },
    btnText: { id: "Turn Off" },
    container: {
      id:
        "After turning off this function, you can begin to withdraw to any withdrawal address, which may lead to greater risk. Are you sure you want to turn it off?",
    },
  }),
  DeleteWhiteList: defineMessages({
    title: { id: "Remove from whitelist" },
    btnText: { id: "Remove" },
    container: { id: "Are you sure you want to remove it?" },
  }),
};
