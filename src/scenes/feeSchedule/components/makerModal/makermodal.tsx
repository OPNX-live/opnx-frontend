import React from 'react';
import { connect } from 'react-redux';
import './makermodal.scss';
import Modal from 'antd/lib/modal/Modal';
import { Button } from 'antd';
import { WrappedComponentProps, injectIntl } from 'react-intl';

interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
}

function MakerModal(props: ItfaValidationProps & WrappedComponentProps) {
  const submit = () => {
    props.onCloseModel(false);
  };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  return (
    <Modal
      className="maker-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="maker-box">
        <div className="maker-title">
          {props.intl.formatMessage({ id: 'fee_Maker/Taker' })}
        </div>
        <div className="maker-subtitle">
          • {props.intl.formatMessage({ id: 'Taker' })}
        </div>
        <p>{props.intl.formatMessage({ id: 'fee_model_message1' })}</p>
        <p>{props.intl.formatMessage({ id: 'fee_model_message2' })}</p>
        <div className="maker-subtitle">
          • {props.intl.formatMessage({ id: 'Maker' })}
        </div>
        <p>{props.intl.formatMessage({ id: 'fee_model_message3' })}</p>
        <p>{props.intl.formatMessage({ id: 'fee_model_message4' })}</p>
        <Button size="large" className="btn-gradient" onClick={submit}>
          {props.intl.formatMessage({ id: 'Got_it' })}
        </Button>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MakerModal));
