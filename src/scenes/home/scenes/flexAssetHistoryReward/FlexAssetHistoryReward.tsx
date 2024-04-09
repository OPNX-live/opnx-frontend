import React, { Component } from 'react';
import { connect } from 'react-redux';
import { IFlexAssetHistoryStates } from './type';
import './FlexAssetHistory.scss';
import { Row, message } from 'antd';
import { getMarkets } from 'service/http/http';
import { messageError } from 'utils';
import { RewardHistort } from './components';
import { injectIntl, WrappedComponentProps } from 'react-intl';


type IFlexAssetHistoryPropsState = ReturnType<typeof mapStateToProps>;
type IFlexAssetHistoryDispatchState = ReturnType<typeof mapDispatchToProps>;
type IFlexAssetHistoryProps = IFlexAssetHistoryPropsState &
  IFlexAssetHistoryDispatchState;
class FlexAssetHistory extends Component<
  IFlexAssetHistoryProps & WrappedComponentProps,
  IFlexAssetHistoryStates
> {

  // Reward
  constructor(props: any) {
    super(props);
    this.state = {
      visible: false,
      marketsType: [],
      exportList: {
        Reward: {},
      },
    }
    // export: {},
  };

  async componentDidMount() {
    const result = await getMarkets();
    if (result.success) {
      const arr = Object.keys(result.data).filter(
        (p) => p.split('-').length === 2
      );
      this.setState({ marketsType: arr });
    }
    !result.success && message.warn(result.message);
  }
  render() {
    const { intl } = this.props;
    return (
      <Row className="flexAssetHistory">
        <Row className="t-h-header">
          {intl.formatMessage({ id: 'Interest Payment' })}
        </Row>
        <Row className="t-h-container">
          <RewardHistort />
        </Row>
      </Row>
    );
  }
}
const mapStateToProps = (state: null) => {
  return {};
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FlexAssetHistory));
