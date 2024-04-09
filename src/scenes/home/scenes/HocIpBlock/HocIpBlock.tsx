/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./HocIpBlock.scss";
import { localStorage } from "utils";
import { getIpBlock } from "service/http/http";
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

export const HocIpBlock = <T extends {}>(Component: Function) => {
  return (props: T & IDepositPropsState & IDepositDispatchState) => {
    const [visible, setVisible] = useState(false);
    const getIpBlockStatus = async () => {
      try {
        const res = await getIpBlock();
        if (res.code === "0000") {
          setVisible(res.data.status === "WARNING");
        }
      } catch (error) {
        console.log(error);
        error?.message && message.error(error?.message);
      }
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      getIpBlockStatus();
    }, []);
    return (
      <>
        {!visible ? (
          <Component {...props} />
        ) : (
          <ICYModal
            closable={true}
            centered
            visible={visible}
            onCancel={() => setVisible(false)}
            width={480}
            className="hoc-ip-block"
          >
            <div className="modal-content">
              We detected that you have accessed Open Exchange from a Restricted
              Country, please withdraw all your funds as the account will be
              closed in 7 days. Otherwise, you will need to prove that you are
              not a resident of a Restricted Country by completing KYC and
              providing a recent Proof of Address. If you are already on KYC,
              please provide a recent Proof of Address by email to
              onboarding@opnx.com.
            </div>
          </ICYModal>
        )}
      </>
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

export default HocIpBlock;
