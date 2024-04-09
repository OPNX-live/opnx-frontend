import React, { useCallback, memo, useState } from "react";
import { connect } from "react-redux";
import {
  message,
  Form, 
  Input, 
  Button
} from 'antd';
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import messageError from 'utils/errorCode';
import PasswordVerify from "components/PasswordVerify/PasswordVerify"
import PwsPrompt from "components/PwsPrompt/PwsPrompt"
import "./index.scss";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = { 
  setBindEmailFrom: Function; 
  bindEmailData: Function; 
  setEmailValue: Function; 
  setPasswordValue: Function; 
  setConfirmPasswordValue: Function; 
  defaultData: any;
  bindEmailFrom: any;
  loading: boolean;
};
type TProps = TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps;

const BindMetaMaskAddressComponent = memo((IProps: TProps ) => {
  const [password, setPassword] = useState("")
  const [isFocus, setIsFocus] = useState(false)
  const { users, intl,  bindEmailData, setEmailValue, setPasswordValue, setConfirmPasswordValue, loading } = IProps;

const onFinish = useCallback((e: any) => {
  const email = e.email;
  const password = e.password;
  const confirmPassword = e.confirmPassword;

  if (users && email) {
    setEmailValue(email);
    setPasswordValue(password);
    setConfirmPasswordValue(confirmPassword);
    bindEmailData({
      email,
      password,
      confirmPassword
    });
  } else {
    message.error(intl.formatMessage({ id: "41004" }));
  }

}, [users, setEmailValue, setPasswordValue, setConfirmPasswordValue, bindEmailData, intl]);

  const handleConfirmPassword = (rule: any, value: any, callback: any) => {
    if (password.replace(/\s+/g, '') !== value.replace(/\s+/g, '')) {
      callback(
        intl.formatMessage({
          id: '45008',
          defaultMessage: 'The passwords do not match , please re-enter',
        })
      );
      return;
    }
    callback();
  }

  const emailChange = useCallback((e: any) => {
    setEmailValue(e.target.value);
  },[setEmailValue]);
  const getLvl = (pwd: string) => {
    let lvl = 0;
    if (/[0-9]/.test(pwd)) {
      lvl++;
    }
    if (/[A-Z]/.test(pwd)) {
      lvl++;
    }
    if (/[a-z]/.test(pwd)) {
      lvl++;
    }
    if (/[`~!@#$%^&*()_+<>?:"{},./;'[\]]/.test(pwd)) {
      lvl++;
    }
    return lvl;
  };
  const handlePassword = async (rule: any, value: any, callback: any) => {
    if (getLvl(value) === 1) {
      return Promise.reject(messageError("41002"));
    } else if (getLvl(value) === 2 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (getLvl(value) === 3 && value.length >= 8) {
      return Promise.reject(messageError("41002"));
    } else if (getLvl(value) === 4 && value.length >= 8) {
      return Promise.resolve();
    }
  };
  const onChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    const value: string = e.target.value;
    setPassword(value)
  }
  return (
    <div className="matemask-bind-email-1">
      <div className="matemask-bind-email-content">
        <div className="matemask-bind-email-model-top">
          <span><FormattedMessage id="Bind you email" /></span>
        </div>
        <div className="matemask-bind-email-input">
          <Form
            name="basic"
            // form={bindEmailFrom}
            {...layout}
            onFinish={onFinish}
          >
            <div className="matemask-bind-email-re-email">
              <FormattedMessage id="Email" />
            </div>
            <Form.Item
              name="email"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: '41006',
                    defaultMessage: 'Please enter the Email',
                  }),
                },
                {
                  pattern: /.*@.*/,
                  message: intl.formatMessage({
                    id: '41004',
                    defaultMessage: 'Please enter a valid email',
                  }),
                },
              ]}
            >
              <Input allowClear={true} type="email" data-type="email" onChange={emailChange}  />
            </Form.Item>
            <div className="matemask-bind-email-re-password">
              <span><FormattedMessage id="Password" /></span>{' '}
              <PasswordVerify pws={password} />
            </div>
            <PwsPrompt pws={password} visible={isFocus} placement="top">
            <Form.Item
              name="password"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: messageError("41008"),
                },
                {
                  message: messageError("41002"),
                  max: 128,
                },
                {
                  min: 8,
                  message: messageError("41002"),
                },
                { validator: handlePassword },
              ]}
            >
              <Input.Password
                allowClear={true}
                data-type="password"
                onBlur={()=> setIsFocus(false)}
                onFocus={()=>setIsFocus(true)}
                onChange={onChange}
              />
            </Form.Item>
            </PwsPrompt>
            <div className="matemask-bind-email-re-confirm">
              <FormattedMessage id="Confirm_Password" />
            </div>
            <Form.Item
              name="confirmPassword"
              className="matemask-bind-email-re-form-item"
              validateFirst={true}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'PleaseConfirm',
                    defaultMessage: 'Please confirm password',
                  }),
                },
                { validator: handleConfirmPassword },
              ]}
            >
              <Input.Password
                allowClear={true}
                data-type="confirmPassword"
              />
            </Form.Item>
            <Form.Item {...tailLayout} className="matemask-bind-email-ant">
              <div className="matemask-bind-email-btn">
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                >
                  <FormattedMessage id="Bind" />
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
});

const mapStateToProps = (state: IGlobalT) => ({
  dashboardUserData: state.dashboardUserData,
  users: state.users,
  mateMaskSelectedAddress: state.mateMaskSelectedAddress
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(BindMetaMaskAddressComponent));
