import React, { useRef, useState } from "react";
import { connect } from "react-redux";
import ICYModal from "../../../../../components/modal/Modal";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Form, message } from "antd";
import InputLine from "components/inputLine/index";
import "./CreateAnti.scss";
import { changeAnti } from "service/http/http";
import TfaValidation from "components/tfaValidation/index";
import { messageError } from "utils";
type ICreateAntitateProps = ReturnType<typeof mapStateToProps>;
type ICreateAntiProps = {
  visible: boolean;
  onCallBack: (off: boolean) => void;
} & WrappedComponentProps &
  ICreateAntitateProps;
export function CreateAnti({
  intl,
  visible,
  onCallBack,
  tfaList
}: ICreateAntiProps) {
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
  const CallBack = async (e: string) => {
    setLoading(true);
    const result = await formRef?.current?.validateFields();
    const params = {
      antiPhishingCode: result.code
    };
    changeAnti(params, e).then((res) => {
      setLoading(false);
      if (res.success) {
        message.success("success");
        onCallBack(true);
      } else {
        message.warning(res.message);
      }
    });
  };
  return (
    <ICYModal
      visible={visible}
      width="342px"
      className="create-anti"
      okLoading={loading}
      okText={"Submit"}
      okHandler={onSubmit}
      onCancel={() => onCallBack(false)}
      closable
    >
      <div className="create-content">
        <div className="create-title">
          {intl.formatMessage({
            id: "Create Anti-Phishing Code",
            defaultMessage: "Create Anti-Phishing Code"
          })}
        </div>
        <Form
          name="basic"
          layout={"vertical"}
          initialValues={{ remember: true }}
          ref={formRef}
        >
          <Form.Item
            label="Anti-phishing Code"
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

const mapStateToProps = (state: { tfaList: string[] }) => ({
  tfaList: state.tfaList
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CreateAnti));
