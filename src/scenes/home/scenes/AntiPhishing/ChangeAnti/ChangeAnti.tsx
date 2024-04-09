import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import ICYModal from "../../../../../components/modal/Modal";
import { Form, message } from "antd";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./ChangeAnti.scss";
import InputLine from "../../../../../components/inputLine/index";
import { changeAnti } from "service/http/http";
import TfaValidation from "components/tfaValidation/index";
import { messageError } from "utils";
type IChangeAntitateProps = ReturnType<typeof mapStateToProps>;
type IChangeAntiProps = {
  visible: boolean;
  onCallBack: (off: boolean) => void;
  antiName: string;
} & WrappedComponentProps&IChangeAntitateProps;
export function ChangeAnti({
  intl,
  visible,
  onCallBack,
  antiName,
  tfaList
}: IChangeAntiProps) {
  const formRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [tfaVisible, setTfaVisible] = useState(false);
  const onSubmit = async () => {
    if (tfaList.length) {
      setTfaVisible(true);
    } else {
      CallBack("");
    }
  };
  const CallBack = async(e: string) => {
    setLoading(true);
    const result = await formRef?.current?.validateFields();
    const params = {
      antiPhishingCode: result.code
    };
    changeAnti(params, e).then((res) => {
      setLoading(false);
      if (res.success) {
        onCallBack(true);
        message.success("success")
      } else {
        message.warning(res.message);
      }
    });
  };
  return (
    <ICYModal
      visible={visible}
      width="342px"
      className="change-anti"
      okText={"Submit"}
      okHandler={onSubmit}
      okLoading={loading}
      onCancel={() => onCallBack(false)}
      closable
    >
      <div className="create-content">
        <div className="create-title">
          {intl.formatMessage({
            id: "Change code",
            defaultMessage: "Change code"
          })}
        </div>
        <div className="old-anti-code">
          <div className="old-title">
            {intl.formatMessage({
              id: "Old Anti-Phishing Code",
              defaultMessage: "Old Anti-Phishing Code"
            })}
          </div>
          <div className="old-code">{antiName}</div>
        </div>
        <Form
          name="basic"
          layout={"vertical"}
          initialValues={{ remember: true }}
          ref={formRef}
        >
          <Form.Item
            label="New Anti-Phishing Code"
            name="code"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "Please input Anti-phishing Code",
                  defaultMessage: "Please input Anti-phishing Code"
                })
              },
              {
                max: 20,
                message: intl.formatMessage({
                  id: "Please enter 4-20 non-special characters",
                  defaultMessage: "Please enter 4-20 non-special characters"
                })
              },
              {
                min: 4,
                message: intl.formatMessage({
                  id: "Please enter 4-20 non-special characters",
                  defaultMessage: "Please enter 4-20 non-special characters"
                })
              }
            ]}
          >
            <InputLine allowClear id={"text"}></InputLine>
          </Form.Item>
        </Form>
        {tfaVisible && (
          <TfaValidation
            visable={tfaVisible}
            onCloseModel={() => setTfaVisible(false)}
            callBack={CallBack}
          />
        )}
      </div>
    </ICYModal>
  );
}

const mapStateToProps = (state: {tfaList:string[]}) => ({
  tfaList: state.tfaList
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ChangeAnti));
