import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, message } from 'antd';
import { setRefresh } from '../../../../../../store/actions/publicAction';
import { submitWithdraw } from '../../../../../../service/http/http';
import {
  IValidationWithdrawProps,
  IValidationProps,
  IParams,
} from './type';
import TfaListVerify from "components/tfaListVerify/tfaListVerify"
import './validationWithdraw.scss';
import { injectIntl, WrappedComponentProps } from 'react-intl';
type IWithdrawalRequestPropsState = ReturnType<typeof mapDispatchToProps> &
  IValidationWithdrawProps;
function ValidationWithdraw(
  props: IWithdrawalRequestPropsState & IValidationProps & WrappedComponentProps
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tfaInpunt, setTfaInpot] = useState<string>('');
  useEffect(() => {
    if(tfaInpunt.length === 52) {
      submit()
    }
  }, [tfaInpunt])
  const onCallback = (event: string) => {
    setTfaInpot(event)
  };
  const submit = () => {
    if (tfaInpunt) {
      setLoading(true);
      const params: IParams = {
        withdrawAddress: props.address,
        amount: props.amount,
        instrumentId: props.coin,
        feeLevel: props.fee ? "medium" : null,
        fee: props.fee,
        network: props.network,
        tag: props.tag
      };
      submitWithdraw(params, tfaInpunt).then((res) => {
        if (res.success) {
          setLoading(false);
          props.onCloseModel(false);
          props.setRefresh(true);
          props.callBack(props.intl.formatMessage({ id: "success" }));
          message.success(
            props.intl.formatMessage({ id: "Saved_successfully" })
          );
        } else {
          setErrorMessage(res.message);
          setLoading(false);
        }
      });
    }
  };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  return (
    <Modal
      className="tfa-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="tfa">
        <div className="tfa-top">
          <div className="tfa-title">
            {props.intl.formatMessage({ id: "tfa_title" })}
          </div>
          <div className="tfa-subtitle">
            {props.intl.formatMessage({ id: "tfa_message" })}
          </div>
        </div>
        <div className="tfa-input">
          {/* <div className="tfa-way">
            {props.dashboardUserData.tfaType&&props.intl.formatMessage({
              id: tfaType[props.dashboardUserData.tfaType],
              defaultMessage: tfaType[props.dashboardUserData.tfaType],
            })}
          </div>
          <Input
            placeholder={props.dashboardUserData.tfaType&&props.intl.formatMessage({
              id: tfaType[props.dashboardUserData.tfaType],
              defaultMessage: tfaType[props.dashboardUserData.tfaType],
            })}
            onPressEnter={submit}
            onChange={onChange}
            autoFocus
          /> */}
          <TfaListVerify onCallback={onCallback} />
        </div>
        <div className="tfa-error">{errorMessage}</div>
        <Button
          size="large"
          loading={loading}
          onClick={submit}
          disabled={tfaInpunt ? false : true}
          type="primary"
        >
          {props.intl.formatMessage({ id: "Verify" })}
        </Button>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: IValidationProps) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setRefresh(data: boolean) {
      dispatch(setRefresh(data));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ValidationWithdraw));
