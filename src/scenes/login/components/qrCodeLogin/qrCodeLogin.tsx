import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import QRCode from "qrcode.react";
import history from "router/history";
import { LoginError, LoginSuccess } from "assets/image";
import "./qrCodeLogin.scss";
import { FormattedMessage } from "react-intl";
import mobile from "assets/image/mobile.png";
import { getCode, qrLogin } from "service/http/http";
import { randomString } from "./data";
import Loadding from "components/loadding";
import { setUser } from "store/actions/publicAction";
import { BASE_URL } from "scenes/home/components/uiHeader/TopHeader";
type IQrlogin = ReturnType<typeof mapDispatchToProps>;
type IQRloginProps = {
  vote: string;
  codeStatus: boolean;
} & IQrlogin;
export function QrCodeLogin({ vote, codeStatus, setUser }: IQRloginProps) {
  let timer: any;
  const [qrCode, setCode] = useState("");
  const [deviceId, setDeviceID] = useState(randomString(32));
  const [loading, setLoading] = useState(false);
  const [refresh, setrefresh] = useState(false);
  const [status, setStatus] = useState("WAITING");
  useEffect(() => {
    setLoading(true);
    getCode(deviceId).then((res) => {
      setLoading(false);
      if (res.success) {
        setCode(res.data);
        // eslint-disable-next-line
        timer = setInterval(() => {
          qrLogin({ qr: res.data, deviceId }).then((result) => {
            if (result.success) {
              setStatus(result.data.status);
              if (result.data.status === "IDENTIFIED") {
                setUser(result.data.loginResp);
                clearInterval(timer);
                setTimeout(() => {
                  refreshLogin();
                }, 3000);
              } else if (result.data.status === "EXPIRE") {
                clearInterval(timer);
              }
            } else {
              setCode("");
              setrefresh(true);
              clearInterval(timer);
            }
          });
        }, 3000);
      } else {
        setCode("");
        setrefresh(true);
        clearInterval(timer);
      }
    });
    return () => {
      clearInterval(timer);
    };
  }, [deviceId]);
  const openStatus = (
    <div className="open-status">
      <div className="open-text">Please upgrade APP to Version 2.6.5 or above for scan login.</div>
      <div className="open-img">
        <img src={mobile} alt="" className="mobile-img" />

        <div className="code">
          <Loadding show={loading ? 1 : 0}>
            {qrCode ? (
              <QRCode value={"https://OPNX.com/ja/mobile-app/?qr=" + qrCode} size={114} />
            ) : (
              <div className="empty-code"></div>
            )}
          </Loadding>
        </div>
      </div>
    </div>
  );
  const refreshNow = () => {
    clearInterval(timer);
    setDeviceID(randomString(32));
    setStatus("WAITING");
    setrefresh(false);
    setCode("");
  };
  const refreshLogin = () => {
    if (vote === "vote") {
      setTimeout(() => {
        history.push("/Vote");
      }, 1000);
      return;
    }
    const paths = sessionStorage.getItem("redirectPath");
    if (paths) {
      setTimeout(() => {
        sessionStorage.removeItem("redirectPath");
        window.location.href = BASE_URL! + paths;
      }, 1000);
    } else {
      setTimeout(() => {
        history.push("/home");
      }, 1000);
    }
  };
  const errorStatus = (
    <div className="error-status">
      <LoginError />
      <div className="error-text">QR Code expired. Please refresh.</div>
      <div className="refresh-now" onClick={refreshNow}>
        Refresh Now
      </div>
    </div>
  );
  const confirmStatus = (
    <div className="error-status">
      <LoginSuccess />
      <div className="error-text">Scan successful. Logging in now.</div>
      <div className="refresh-now" onClick={refreshLogin}>
        Refresh Now
      </div>
    </div>
  );
  const successStatus = (
    <div className="success-status">
      <div className="error-text">Successfully scanned. Please confirm from Mobile.</div>
      <div className="refresh-now" onClick={refreshNow}>
        Refresh Now
      </div>
    </div>
  );
  const loginStatus = () => {
    if (refresh) {
      return errorStatus;
    }
    switch (status) {
      case "WAITING":
        return openStatus;
      case "IN_CONFIRMATION":
        return successStatus;
      case "IDENTIFIED":
        return confirmStatus;
      case "EXPIRE":
        return errorStatus;
      default:
        return;
    }
  };
  return (
    <div className="qr-login">
      {codeStatus && <span className="open-mobile">Open Mobile Scan QR Code</span>}
      <div className="qr-box">{loginStatus()}</div>
      <div className="to-register">
        <FormattedMessage id="no_account_yet" defaultMessage=" No account yet?" />
        <span
          className="reg-link"
          onClick={() => {
            history.replace("/register");
          }}
        >
          <FormattedMessage id="Register" defaultMessage="Register" />
        </span>
      </div>
    </div>
  );
}

const mapStateToProps = (state: string) => ({});

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setUser(data: Iusers) {
      dispatch(setUser(data));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QrCodeLogin);
