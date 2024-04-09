import React from 'react';
import { intl } from 'utils/Language';
export function status(status) {
  if (status === 'INVERSE_BTC') {
    return <span>Inverse-BTC</span>;
  } else if (status === 'INVERSE_ETH') {
    return <span>Inverse-ETH</span>;
  } else if (status === 'LINEAR') {
    return <span>{intl('Linear-USD')}</span>;
  } else if (status === 'TRADING') {
    return <span>{intl('Trading')}</span>;
  } else {
    return status;
  }
}
