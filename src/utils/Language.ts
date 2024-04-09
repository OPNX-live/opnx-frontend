import store from "../store/index";
import { createIntl, createIntlCache } from "react-intl";
import zh from "../locale/zh.json";
import en from "../locale/en.json";
const locale: { [key: string]: any } = {
  "en": en,
  "zh": zh,
};
export const intl = (code: string) => {
  let SwitchLanguage: any;
  SwitchLanguage = store.getState().SwitchLanguage;
  store.subscribe(() => {
    SwitchLanguage = store.getState().SwitchLanguage;
  });
  const intl= createIntl(
    {
      locale: SwitchLanguage,
      messages: locale[SwitchLanguage],
    },
    createIntlCache()
  ).formatMessage({ id: code });
  return intl
};
