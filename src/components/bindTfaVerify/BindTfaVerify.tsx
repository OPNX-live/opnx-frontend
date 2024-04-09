import React, { useState, useEffect, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import { Button, Modal } from "antd";
import TfaListVerify from "../tfaListVerify/tfaListVerify";
import "./BindTfaVerify.scss";
import { debounce } from "lodash";
interface IbindRfa {
  onBack: (off: boolean, code?: string, value?: string) => void;
  visible: boolean;
  loading: boolean;
}
export function BindTfaVerify({
  visible,
  onBack,
  loading,
  tfaList,
}: IbindRfa & ReturnType<typeof mapStateToProps>) {
  const [tfaCode, setTfaCode] = useState("");
  const [value, setValue] = useState<string | undefined>("");
  const tfaCodeRef = useRef("");
  const valueRef = useRef("");
  const onCallback = (e: string, type: string, value?: string) => {
    tfaCodeRef.current = e;
    valueRef.current = value;
    setTfaCode(e);
    setValue(value);
  };

  useEffect(() => {
    // tslint:disable-next-line: no-use-before-declare
    window.addEventListener(
      "keypress",
      debounce((e) => {
        if (e.key === "Enter") {
          if (tfaCodeRef.current?.length === 52) {
            onBtnClick();
          }
        }
      }, 300)
    );
    // if (tfaCode.length === 52 && !tfaList?.length) {
    //   onBtnClick();
    // }
    return () => window.removeEventListener("keypress", () => {});
  }, []);
  const onBtnClick = () => {
    console.log("tfaCodeRef.current", tfaCodeRef.current);
    if (tfaCodeRef.current && (tfaList?.length < 1 ? valueRef.current : true)) {
      onBack(true, tfaCodeRef.current, valueRef.current);
    }
  };
  return (
    <Modal
      className="bind-tfa-model"
      visible={visible}
      footer={null}
      onCancel={() => onBack(false)}
    >
      <div className="bind-tfa">
        <div className="bind-tfa-content">
          <div className="tfa-top">
            <div className="tfa-title">Security Verification</div>
            <div className="tfa-subtitle">
              To secure your account, please complete the following verification
            </div>
          </div>
          <div className="tfa-input">
            <TfaListVerify
              onCallback={onCallback}
              modalType={tfaList?.length < 1 ? "BIND_TFA" : undefined}
            />
            <Button
              size="large"
              type="primary"
              loading={loading}
              onClick={onBtnClick}
              disabled={
                tfaCode && (tfaList?.length < 1 ? value : true) ? false : true
              }
            >
              <FormattedMessage id="Submit" defaultMessage="Submit" />
            </Button>
          </div>
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

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(BindTfaVerify);
