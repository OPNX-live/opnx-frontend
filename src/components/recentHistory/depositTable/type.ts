export const convertFont = (e: string, intl: any) => {
  switch (e) {
    case 'PENDING':
      return intl.formatMessage({ id: 'Pending' });
    case 'FAILED':
      return intl.formatMessage({ id: 'Failed' });
    case 'COMPLETED':
      return intl.formatMessage({ id: 'Completed' });
    default:
      return intl.formatMessage({ id: e, defaultMessage: e });
  }
};
