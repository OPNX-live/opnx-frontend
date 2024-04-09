import React, { useCallback, useState, memo } from "react";
import { Button, Modal, message } from "antd";

import { connect } from "react-redux";
import messageError from "utils/errorCode";
import {
  setMateMaskAddress,
  setDashboardUserData,
} from "store/actions/publicAction";
import { UserData, bindMetaMaskAddress } from "service/http/http";
import { getEthereumProvider } from "utils/ethProvider";
import { localStorage } from "utils/storage";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import "./index.scss";

// import AddressManagementComponent from "../addressManagementComponent";
type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = {};
type TProps = TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps;

const BindMetaMaskEmailComponent = memo((IProps: TProps) => {
  // const { SwitchLanguage, dashboardUserData, users, intl, setIsWhitetfa } = IProps;
  const { users, intl, setDashboardUserData } = IProps;
  const [loading, setLoading] = useState(false);
  const [bindEmailFail, setBindEmailFail] = useState(false);
  // const [bindEmailFailText, setBindEmailFailText] = useState("");
  // setWhiteListModal emailCode

  const bindEvent = useCallback(async () => {
    setLoading(true);
    const ethProvider = await getEthereumProvider();
    try {
      if (ethProvider) {
        const signer = ethProvider.getSigner();
        const address = await signer.getAddress();

        if (address) {
          const bindRes = await bindMetaMaskAddress(address);
          setLoading(false);
          if (bindRes) {
            message.success(intl.formatMessage({ id: "Bind Success" }));
            UserData().then((res) => {
              if (res.code === "0000") {
                setDashboardUserData(res.data);
              } else {
                message.error(res.message);
              }
            });
          } else {
            setBindEmailFail(true);
          }
          setLoading(false);
          localStorage.set("timingdown", "");
          localStorage.set("metamaskbindemail", "");
        }
      } else {
        setLoading(false);
        message.error(
          intl.formatMessage({ id: "MetaMask open failed, place try again" })
        );
      }
    } catch (err) {
      setLoading(false);
      message.error(
        intl.formatMessage({ id: "MetaMask open failed, place try again" })
      );
    }
  }, [intl, setDashboardUserData]);

  return null;
});

const mapStateToProps = (state: IGlobalT) => ({
  dashboardUserData: state.dashboardUserData,
  users: state.users,
  SwitchLanguage: state.SwitchLanguage,
  mateMaskSelectedAddress: state.mateMaskSelectedAddress,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {
    setMateMaskAddress(data: string) {
      dispatch(setMateMaskAddress(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BindMetaMaskEmailComponent));
