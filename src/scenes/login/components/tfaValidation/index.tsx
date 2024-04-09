import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button, message } from "antd";
import "./index.scss";
import { getIpBlock, tfaLogin } from "service/http/http";
import { messageError, marketCommunication } from "utils";
import history from "router/history";
import {
  setDashboardUserData,
  setUser,
  setSubAccouts,
  setIsLogin
} from "store/actions/publicAction";
import TfaListVerify from "components/tfaListVerify/tfaListVerify";
import { BASE_URL } from "scenes/home/components/uiHeader/TopHeader";
import { FormattedMessage, WrappedComponentProps } from "react-intl";
import { GetRequest } from "scenes/verifyAccount/data";
import Modal from "components/modal/Modal";

interface ItfaProps {
  dashboardUserData: IDashboardUserData;
}
type ILoginPropsState = ReturnType<typeof mapStateToProps>;

type ILoginDispatchState = ReturnType<typeof mapDispatchToProps>;
// const eunmTfaType: any = {
//   AUTHY_SECRET: 'Authy',
//   AUTHY_PHONE: 'Authy',
//   GOOGLE: 'GoogleAuth',
//   YUBIKEY: 'YubiKey',
// };

function TfaLoginValidation(
  props: ItfaProps &
    ILoginDispatchState &
    ILoginPropsState &
    WrappedComponentProps
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [ipBlockVisible, setIpBlockVisible] = useState<boolean>(false);
  const [date, setData] = useState<any>({});
  // const [path, setPath] = useState<string>('');
  const [vote, setVote] = useState<string>("");
  const [tfaCode, setTfaCode] = useState<string>("");
  const [value, setValue] = useState<string | undefined>("");
  useEffect(() => {
    const data = history.location.state as any;
    setData(data.data);
    setVote(data.vote);
    // setPath(data.path);
  }, []);
  useEffect(() => {
    if (tfaCode.length === 52 && !date.unusualIpAndDevice) {
      tfaAuth();
    }
  }, [tfaCode, date]);
  const onCallback = (e: string, p: string, value?: string) => {
    setTfaCode(e);
    setValue(value);
  };

  const getIpBlockData = async () => {
    try {
      const res = (await getIpBlock()).data;
      if (res.status === "WARNING") {
        setIpBlockVisible(true);
        return true;
      }
      return false;
    } catch (error) {}
  };

  const closeIpBlockModal = () => {
    setIpBlockVisible(false);
    if (vote === "vote") {
      setTimeout(() => {
        setLoading(false);
        history.push("/Vote");
      }, 1000);
      return;
    }
    const paths = sessionStorage.getItem("redirectPath");
    if (paths) {
      setTimeout(() => {
        setLoading(false);
        sessionStorage.removeItem("redirectPath");
        window.location.href = BASE_URL! + paths;
      }, 1000);
    } else {
      setTimeout(() => {
        setLoading(false);
        history.push("/home");
      }, 1000);
    }
  };

  const tfaAuth = () => {
    if (tfaCode && (date.unusualIpAndDevice ? value : true)) {
      setLoading(true);
      tfaLogin(tfaCode, date.token, value).then(async (res) => {
        if (res.code === "0000") {
          props.setUser({
            ...res.data
            // token: date.token
          });
          marketCommunication({
            ...res.data
            // token: date.token
          });
          props.setIsLogin(true);
          props.setSubAccouts();
          const isBool = await getIpBlockData();
          if (isBool) {
            return;
          }
          if (vote === "vote") {
            setTimeout(() => {
              setLoading(false);
              history.push("/Vote");
            }, 1000);
            return;
          }
          const paths = sessionStorage.getItem("redirectPath");
          if (paths) {
            setTimeout(() => {
              setLoading(false);
              sessionStorage.removeItem("redirectPath");
              window.location.href = BASE_URL! + paths;
            }, 1000);
          } else {
            setTimeout(() => {
              setLoading(false);
              history.push("/home");
            }, 1000);
          }
        } else {
          setLoading(false);
          message.error(res.message);
        }
      });
    } else {
      message.warning("");
    }
  };
  return (
    <div className="login-tfa">
      <div className="login-tfa-content">
        <div className="tfa-top">
          <div className="tfa-title">
            <FormattedMessage
              id="tfa_title"
              defaultMessage="2-Step Verification"
            />
          </div>
          <div className="tfa-subtitle">
            <FormattedMessage
              id="tfa_message"
              defaultMessage="Enter your two-factor authentication (2FA) token"
            />
          </div>
        </div>
        <div className="tfa-input">
          <TfaListVerify
            onCallback={onCallback}
            modalType="CHECK_IP"
            loginEmail={date.mainLogin ? date.email : date.mainEmail}
            unusualIpAndDevice={date.unusualIpAndDevice}
            loginName={date.email}
          />
          <Button
            size="large"
            loading={loading}
            onClick={tfaAuth}
            type="primary"
            disabled={
              tfaCode && (date.unusualIpAndDevice ? value : true) ? false : true
            }
          >
            <FormattedMessage id="Verify" defaultMessage="Verify" />
          </Button>
        </div>
        {/* <div className="tfa-error">{errorMessage}</div> */}
      </div>
      {ipBlockVisible ? (
        <Modal
          visible={ipBlockVisible}
          okHandler={closeIpBlockModal}
          okText={"Close"}
          title={"Tip"}
        >
          <FormattedMessage
            id="ipBlockTip"
            defaultMessage="We detected that you have accessed OPNX from a Restricted
            Country, please withdraw all your funds as the account will be
            closed in 7 days. Otherwise, you will need to prove that you are not
            a resident of a Restricted Country by completing KYC 3 and providing
            a recent Proof of Address. If you are already on KYC 3, please
            provide a recent Proof of Address by email to
            onboarding@OPNX.com."
          />
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    users: state.users
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
    setUser(data: any, type?: string) {
      dispatch(setUser(data, "login"));
    },
    setSubAccouts() {
      dispatch(setSubAccouts());
    },
    setIsLogin(data: boolean) {
      dispatch(setIsLogin(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TfaLoginValidation);
