import React from 'react';
import { connect } from 'react-redux';
import DisgiramLeft from '../DisgiramLeft/DisgiramLeft';
import DisgirmPnl from '../DisgirmPnl/DisgirmPnl';
import './DisgiramBox.scss';
import { WrappedComponentProps, injectIntl } from 'react-intl';
type Iprops = {
  date: { start: string; end: string };
  hide: boolean;
  pnl: {
    pnlRatio: string;
    todayPnl: string;
  };
  balance: {
    marketValue: string;
    tradingType: string;
    balance: string;
  };
} & WrappedComponentProps;
export const DisgiramBox = ({ date, hide, pnl, balance, intl }: Iprops) => {
  return (
    <div className="dis-box">
      <DisgirmPnl date={date} hide={hide} pnl={pnl} />
      <DisgiramLeft
        date={date}
        hide={hide}
        pnl={pnl}
        balance={balance}
        intl={intl}
      />
    </div>
  );
};
const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DisgiramBox));
