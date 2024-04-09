/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import DisableModal from "./DisableModal/DisableModal";
import "./HocDisable.scss";
import { localStorage } from "utils";
import { getIpBlock, googleLogin } from "service/http/http";
import { setUser } from "store/actions/publicAction";
import { WrappedComponentProps } from "react-intl";
import history from "router/history";
import { IDepositProps } from "../deposit/data";
import { DOMAIN, useAccount } from "@opnx-pkg/uikit";
import { message } from "antd";
import ICYModal from "components/modal/Modal";
type IDepositPropsState = ReturnType<typeof mapStateToProps>;
type IDepositDispatchState = ReturnType<typeof mapDispatchToProps> &
  WrappedComponentProps;

export const HocDisable = <T extends {}>(Component: Function) => {
  return (props: T & IDepositPropsState & IDepositDispatchState) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState("state=");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [code, setCode] = useState("code=");
    const [visible, setVisible] = useState(false);
    const { setUser } = useAccount();
    const gLogin = async () => {
      try {
        const pathArr = history.location.search.substring(1).split("&");
        let state = "";
        let code = "";
        pathArr.forEach((item, idx) => {
          if (item.indexOf("state=") !== -1) {
            state = pathArr[idx].split("state=")[1];
            setState(pathArr[idx].split("state=")[1] ?? "");
          }
          if (item.indexOf("code=") !== -1) {
            code = pathArr[idx].split("code=")[1];
            setCode(pathArr[idx].split("code=")[1] ?? "");
          }
        });
        if (!state || !code) {
          setCode("");
          setState("");
          return;
        }
        const res = await googleLogin({
          state,
          code,
        });
        if (res.code === "0000") {
          props.setUser({
            ...res.data,
          });
          localStorage.set("user", {
            ...res.data,
          });
          setUser({
            ...res.data,
          });
          await getIpBlockStatus();
          window.history.pushState({}, "0", window.location.pathname);
        } else {
          message.error(res.message);
          setTimeout(() => {
            window.location.href = DOMAIN.UI + "/login";
          }, 2000);
          throw new Error(res.message);
        }
        setCode("");
        setState("");
      } catch (error) {
        console.log(error);
        error?.message && message.error(error?.message);
      }
    };
    const getIpBlockStatus = async () => {
      try {
        const res = await getIpBlock();
        if (res.code === "0000") {
          localStorage.set("ipBlock", res.data.status === "WARNING");
        }
      } catch (error) {
        console.log(error);
        error?.message && message.error(error?.message);
      }
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      gLogin();
    }, []);
    useEffect(() => {
      setVisible(localStorage.get("ipBlock"));
    }, [localStorage.get("ipBlock")]);
    return (
      <div id="DisableModal" className="hoc-disable">
        {!state && !code ? <Component {...props} /> : null}
        <ICYModal
          closable={true}
          centered
          visible={visible}
          onCancel={() => {
            setVisible(false);
            localStorage.set("ipBlock", false);
          }}
          width={480}
          className="hoc-ip-block"
        >
          <div className="modal-content">
            We detected that you have accessed Open Exchange from a Restricted
            Country, please withdraw all your funds as the account will be
            closed in 7 days. Otherwise, you will need to prove that you are not
            a resident of a Restricted Country by completing KYC and providing a
            recent Proof of Address. If you are already on KYC, please provide a
            recent Proof of Address by email to onboarding@opnx.com.
          </div>
        </ICYModal>
      </div>
    );
  };
};
const mapStateToProps = (state: IDepositProps) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser(data: any, type?: string) {
      dispatch(setUser(data, "login"));
    },
  };
};

export default HocDisable;
