import React, { Component } from 'react';
import { connect } from 'react-redux';
import { staticData } from './data';
import LCYModal from 'components/modal/Modal';
import { closeBorrow } from 'service/http/http';
import { message } from 'antd';
import { WrappedComponentProps } from 'react-intl';
type WhiteListModalProps = {
  type: 'Trade' | 'Failed';
  visible: boolean;
  accountId?: string;
  coin: string;
  handleCloseModal: (show: boolean) => void;
  Callback: (show: boolean) => void;
} & WrappedComponentProps;
type WhiteListModalState = {
  loading: boolean;
};
export class WhiteListModal extends Component<
  WhiteListModalProps,
  WhiteListModalState
> {
  constructor(props: WhiteListModalProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  closeModal = () => {
    this.props.handleCloseModal(false);
  };
  enable = () => {
    if (this.props.type === 'Trade') {
      this.onCloseBorrow();
    } else {
      this.props.Callback(false);
    }
  };
  onCloseBorrow = () => {
    this.setState({ loading: true });
    closeBorrow(this.props.accountId).then((res) => {
      this.setState({ loading: false });
      if (res.code === '0000' && res.data) {
        message.success(
          this.props.intl.formatMessage({
            id: 'success',
            defaultMessage: 'success',
          })
        );
        this.props.Callback(false);
      } else {
        this.props.Callback(true);
      }
    });
  };
  render() {
    const { type, visible, coin } = this.props;
    return (
      <LCYModal
        okLoading={this.state.loading}
        visible={visible}
        title={staticData[type].title}
        width={408}
        cancleHandler={this.closeModal}
        okHandler={this.enable}
        okText={staticData[type].btnText}
        cancelText={
          type === 'Trade'
            ? this.props.intl.formatMessage({
                id: 'ThinkAbout',
                defaultMessage: 'Think about',
              })
            : ''
        }
      >
        {type === 'Trade'
          ? staticData[type].container.replace('BTC', coin)
          : staticData[type].container}
      </LCYModal>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WhiteListModal);
