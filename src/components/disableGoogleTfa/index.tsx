import React, { ChangeEvent, useReducer, useState } from "react";
import { connect } from "react-redux";
import { Modal, Alert, Input, Button, message } from "antd";
import { closeTfa } from "../../service/http/http";
import messageError from "../../utils/errorCode";
import TfaListVerify from "../tfaListVerify/tfaListVerify";
import "./index.scss";
import { FormattedMessage, WrappedComponentProps } from "react-intl";
const DisableGoogleTfaState = {
  password: "",
  tfaCode: "",
  loading: false,
  tfaType: "",
};
type IDisableProps = ReturnType<typeof mapStateToProps>;
type IDisableGoogleTfaState = {
  // password: string;
  tfaCode: string;
  loading: boolean;
  tfaType: string;
};
type IIDisableGoogleTfaProps = {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: (success: string) => void;
  type: string;
} & IDisableProps;
function DisableGoogleTfa(
  props: IIDisableGoogleTfaProps & WrappedComponentProps
) {
  const [DisableGoogleTfa, SubAccoutDispatch] = useReducer(
    (state: IDisableGoogleTfaState, action: any) => {
      switch (action.type) {
        case "password":
          return { ...state, password: action.password };
        case "tfaCode":
          return { ...state, tfaCode: action.tfaCode };
        case "loading":
          return { ...state, loading: action.loading };
        case "tfaType":
          return { ...state, tfaType: action.tfaType };
        default:
          return state;
      }
    },
    DisableGoogleTfaState
  );
  const [value, setValue] = useState<string | undefined>("");
  const onFinish = () => {
    // const password = DisableGoogleTfa.password;
    const tfaCode = DisableGoogleTfa.tfaCode;
    if (tfaCode) {
      SubAccoutDispatch({ type: "loading", loading: true });
      closeTfa(tfaCode, value).then((res) => {
        SubAccoutDispatch({ type: "loading", loading: false });
        if (res.success) {
          props.onCloseModel(false);
          props.callBack(props.intl.formatMessage({ id: "success" }));
        } else {
          message.warning(res.message);
        }
      });
    }
  };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  const onPwsChnage = (e: ChangeEvent<HTMLInputElement>) => {
    SubAccoutDispatch({ type: "password", password: e.target.value });
  };
  const onCallBack = (e: string, type: string, emialCode?: string) => {
    SubAccoutDispatch({ type: "tfaCode", tfaCode: e });
    SubAccoutDispatch({ type: "tfaType", tfaType: type });
    setValue(emialCode);
  };
  return (
    <Modal
      className="disable-tfa"
      visible={props.visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="disable-content">
        <div className="disable-title">Security Verification</div>
        {props.tfaList.length === 1 && (
          <Alert
            message={
              <FormattedMessage
                id="disabling2fa"
                defaultMessage="We strongly recommend activating 2FA. It is an important security measure to protect your account. After disabling 2FA, withdrawal capabilities may be suspended for up to 24 hours if our risk system detects suspicious activity."
              />
            }
            type="warning"
            showIcon
          />
        )}
        {props.tfaList.length > 1 && (
          <Alert
            message={
              "To secure your account, please complete the following verification"
            }
            type="warning"
            showIcon
          />
        )}
        <div className="disable-box">
          <TfaListVerify
            onCallback={onCallBack}
            tfaType={props.type}
            modalType="DELETE_TFA"
          />
          {/* <div className="disbale-pas"> Password</div>
          <Input.Password
            placeholder={props.intl.formatMessage({ id: "Password" })}
            onChange={onPwsChnage}
          /> */}
          <Button
            type="primary"
            onClick={onFinish}
            disabled={
              DisableGoogleTfa.tfaCode &&
              //  DisableGoogleTfa.password &&
              value
                ? false
                : true
            }
            loading={DisableGoogleTfa.loading}
          >
            {props.intl.formatMessage({ id: "Submit" })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: { tfaList: string[] }) => {
  return {
    tfaList: state.tfaList,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DisableGoogleTfa);
