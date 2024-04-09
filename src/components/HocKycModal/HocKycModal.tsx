import React, { useEffect, useState } from "react";
import "./HocKycModal.scss";
import ICYModal from "components/modal/Modal";
import { setUser } from "store/actions/publicAction";
import { WrappedComponentProps } from "react-intl";
import { getKycResult } from "service/http/http";

type IDepositPropsState = ReturnType<typeof mapStateToProps>;
type IDepositDispatchState = ReturnType<typeof mapDispatchToProps> &
  WrappedComponentProps;

export const HocKycModal = <T extends {}>(
  Component: Function,
  type: string
) => {
  return (props: T & IDepositPropsState & IDepositDispatchState) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      init();
    }, []);
    const init = async () => {
      const res = await getKycResult();
      if (res.success) {
        setVisible(Boolean(!res.data?.kycOpened));
      }
    };
    return (
      <>
        <Component {...props} />
        <ICYModal
          closable={true}
          visible={visible}
          onCancel={() => setVisible(false)}
          width={480}
          className="hoc-kyc-modal"
        >
          <div className="modal-content">
            To {type} funds, please <a href="/account/KYC">complete KYC</a>{" "}
            verification.
          </div>
        </ICYModal>
        {/* // )} */}
      </>
    );
  };
};
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
    kycOpened: state.kycInfo?.kycOpened,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setUser(data: any, type?: string) {
      dispatch(setUser(data, "login"));
    },
  };
};

export default HocKycModal;
