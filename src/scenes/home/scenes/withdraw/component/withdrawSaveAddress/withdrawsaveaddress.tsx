import React, { useContext, useState } from 'react';
import { connect } from 'react-redux';
import { Modal, Input, Button, Form, message } from 'antd';
import { WithdrawContainerContext } from '../../withdraw';
import './withdrawsaveaddress.scss';
import { saveAddress } from 'service/http/http';
import { messageError } from 'utils';
import { IWithdrawState } from '../../data';
import { injectIntl, WrappedComponentProps } from 'react-intl';
interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: (success: boolean) => void;
  address: string;
  network: string;
  tag: string;
}
interface IParams {
  instrumentId: string;
  address: string;
  walletLabel: string;
  isWhiteList: boolean;
  network: string;
  tag: string;
}
interface ItfaProps {
  dashboardUserData: IDashboardUserData;
}

function WithdrawSaveAddress(
  props: ItfaValidationProps & ItfaProps & WrappedComponentProps
) {
  const value: IWithdrawState = useContext(WithdrawContainerContext);
  const [loading, setLoading] = useState<boolean>(false);
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  const onFinish = (values: any) => {
    const params: IParams = {
      instrumentId: value.coin,
      address: props.address,
      walletLabel: values.value,
      isWhiteList: false,
      network: props.network,
      tag: props.tag,
    };
    setLoading(true);
    saveAddress(params).then((res) => {
      if (res.success) {
        props.callBack(true);
        setLoading(false);
        props.onCloseModel(false);
        message.success(props.intl.formatMessage({ id: 'Saved_successfully' }));
      } else {
        message.warning(res.message);
        setLoading(false);
        props.onCloseModel(false);
      }
    });
  };

  const onFinishFailed = (errorInfo: any) => {};

  return (
    <Modal
      className="withdrawSaveAddress-model"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="tfa">
        <div className="tfa-top">
          <div className="tfa-title">
            {props.intl.formatMessage({ id: 'Save_address' })}
          </div>
        </div>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="value"
            rules={[
              {
                pattern: /^([a-zA-Z\u4e00-\u9fa5a-z\d_. /]{4,20})$/gi,
                message: props.intl.formatMessage({ id: 'value_error' }),
              },
              {
                required: true,
                message: props.intl.formatMessage({ id: 'value_error' }),
              },
            ]}
          >
            <Input
              placeholder={props.intl.formatMessage({ id: 'Wallet_Label' })}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" loading={loading} htmlType="submit">
              {props.intl.formatMessage({ id: 'Create' })}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: ItfaProps) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(WithdrawSaveAddress));
