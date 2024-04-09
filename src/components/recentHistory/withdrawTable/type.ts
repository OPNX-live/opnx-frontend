export const convertFont = (e: string, intl: any) => {
  switch (e) {
    case 'PENDING':
      return intl.formatMessage({ id: 'Pending' });
    case 'FAILED':
      return intl.formatMessage({ id: 'Failed' });
    case 'PUBLISHED':
      return intl.formatMessage({ id: 'Completed' });
    case 'ON_HOLD':
      return intl.formatMessage({ id: 'On hold' });
    default:
      return intl.formatMessage({ id: e, defaultMessage: e });
  }
};
