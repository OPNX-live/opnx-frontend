import { intl } from 'utils/Language';
export const staticData = {
  Trade: {
    title: intl('Trade repayment'),
    btnText: intl("I'm sure"),
    container: intl(
      'Please confirm if you have closed your swap position and get your BTC back.'
    ),
  },
  Failed: {
    title: intl('Trade repayment failed'),
    btnText: intl('I Know'),
    container: intl(
      'Found that you have a long position that has not been closed. Please choose to repay or close the position manually.'
    ),
  },
};
