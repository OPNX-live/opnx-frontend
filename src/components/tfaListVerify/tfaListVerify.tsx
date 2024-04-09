import React, {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { connect } from "react-redux";
import { authy } from "../disableGoogleTfa/type";
import { Input } from "antd";
import "./tfaListVerify.scss";
import SendCodeInput from "components/SendCodeInput/SendCodeInput";
import { FormattedMessage } from "react-intl";
type ITfaDisProps = ReturnType<typeof mapStateToProps>;
type ITflistProps = {
  onCallback: (tfa: string, type: string, modalType?: string) => void;
  tfaType?: string;
  value?: string;
  modalType?: "ADD_API_KEY" | "DELETE_TFA" | "BIND_TFA" | "CHECK_IP";
  unusualIpAndDevice?: boolean;
  loginEmail?: string;
  loginName?: string;
} & ITfaDisProps;
export const TfaListVerify: React.FC<ITflistProps> = memo(
  ({
    onCallback,
    tfaType,
    tfaList,
    modalType,
    loginEmail,
    unusualIpAndDevice,
    loginName
  }) => {
    const [placeholder, setPlaceholder] = useState(
      tfaType ? authy[tfaType] : authy[tfaList[0]]
    );
    const strRef = useRef<string>();
    const v = useRef<string>();
    const onClickTfa = (tfa: string) => {
      setPlaceholder(tfa);
    };
    const onChange = (e: any) => {
      const value = e.target.value;
      const str = value?.replace(/\s*/g, "");
      strRef.current = str;
      if (str) {
        onCallback(authy[placeholder] + "/" + str, placeholder, v?.current);
        return;
      }
      strRef.current = "";
      onCallback("", placeholder, v?.current);
    };
    const searchTfa = useMemo(() => {
      return (type: string) => {
        if (tfaList && tfaList.length) {
          if (tfaType) {
            return type === tfaType;
          }
          return tfaList.find((i) => i === type);
        }
      };
    }, [tfaType, tfaList]);
    return (
      <div className="tfa-list">
        {modalType ? (
          modalType === "CHECK_IP" && !unusualIpAndDevice ? null : (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  color: "#333333",
                  fontSize: "16px",
                  marginTop: "32px"
                }}
              >
                <FormattedMessage id="Email Code" defaultMessage="Email Code" />
              </div>
              <SendCodeInput
                type={modalType as string}
                loginEmail={loginEmail}
                loginName={loginName}
                change={(e) => {
                  v.current = e;
                  onChange({ target: { value: strRef.current as string } });
                }}
              />
            </div>
          )
        ) : null}
        <div className="tfa-box">
          {searchTfa("AUTHY_SECRET") && (
            <label
              htmlFor="cheese"
              className={`google-auth ${
                placeholder === "Authy" && "tfa-hover"
              }`}
              onClick={onClickTfa.bind(null, "Authy")}
            >
              Authy
            </label>
          )}
          {searchTfa("GOOGLE") && (
            <label
              htmlFor="cheese"
              className={`google-auth ${
                placeholder === "Google Auth" && "tfa-hover"
              }`}
              onClick={onClickTfa.bind(null, "Google Auth")}
            >
              Google Auth
            </label>
          )}
          {searchTfa("YUBIKEY") && (
            <label
              htmlFor="cheese"
              className={`google-auth ${
                placeholder === "YubiKey" && "tfa-hover"
              }`}
              onClick={onClickTfa.bind(null, "YubiKey")}
            >
              YubiKey
            </label>
          )}
        </div>
        <Input
          placeholder={placeholder}
          onChange={onChange}
          autoFocus
          id="cheese"
        />
      </div>
    );
  }
);

const mapStateToProps = (state: { tfaList: string[] }) => {
  return {
    tfaList: state.tfaList
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TfaListVerify);
