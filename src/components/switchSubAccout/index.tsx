import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Modal, message, Radio } from "antd";
import { Loadding } from "components/loadding";
import { SwitchAccout, UserData } from "service/http/http";
import {
  setAccountName,
  setUser,
  setDashboardUserData
} from "store/actions/publicAction";
import messageError from "utils/errorCode";
import { status } from "./data";
import history from "router/history";
import { injectIntl, WrappedComponentProps } from "react-intl";
import "./index.scss";

interface ISwitchSubAccoutProps {
  visible: boolean;
  onCloseModel: (off: boolean) => void;
}
interface IPropsState {
  subAccounts: IAllAccout[];
  accountName: string;
  users: Iusers;
  dashboardUserData: IDashboardUserData;
}
type INamePropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps> &
  INamePropsState;
export function SwitchSubAccout(
  props: ISwitchSubAccoutProps & INameDispatchState & WrappedComponentProps
) {
  const [accountId, setAccoutId] = useState<string>("");
  const [loadding, setLoadding] = useState<boolean>(false);
  useEffect(() => {
    const accountProps: IAllAccout = props.subAccounts.filter(
      (i: IAllAccout) => i.accounts.accountName === props.users.accountName
    )[0];
    setAccoutId(accountProps.accounts.accountId);
  }, [props.subAccounts, props.users.accountName]);
  const onCancel = () => {
    props.onCloseModel(false);
  };
  const subClick = (e: any) => {
    setAccoutId(e);
    setLoadding(true);
    SwitchAccout(e).then((res) => {
      if (res.success) {
        const data: Iusers = res.data;
        props.setUser(data);
        props.onCloseModel(false);
        UserData().then((res) => {
          if (res.code === "0000") {
            props.setDashboardUserData(res.data);
          } else {
            message.error(res.message);
          }
          setTimeout(() => {
            setLoadding(false);
            window.location.reload();
          }, 1000);
        });
      } else {
        setLoadding(false);
        res.message;
      }
    });
  };
  return (
    <Modal
      className="switch-window"
      title={props.intl.formatMessage({ id: "switch_account" })}
      visible={props.visible}
      onCancel={onCancel}
      footer={null}
    >
      <Loadding show={loadding ? 1 : 0} style={{ backgroundColor: "white" }}>
        <div className="big-box">
          {props.subAccounts.map((i: IAllAccout, index: any) => {
            return (
              <div
                className="window-info"
                key={index}
                onClick={subClick.bind(null, i.accounts.accountId)}
                style={
                  i.accounts.accountId === accountId ? { color: "#318BF5" } : {}
                }
              >
                <div className="info-account-div">
                  <div>
                    {i.accounts.accountName === props.users.email
                      ? props.intl.formatMessage({
                          id: "Main_Account",
                          defaultMessage: "Main Account"
                        })
                      : i.accounts.accountName}
                  </div>
                  <span>
                    /
                    {status(i.accounts.tradingType)
                      ? status(i.accounts.tradingType)
                      : i.accounts.tradingType}
                  </span>
                </div>
                <Radio
                  checked={i.accounts.accountId === accountId ? true : false}
                ></Radio>
              </div>
            );
          })}
        </div>
        {props.users.mainLogin && !props.dashboardUserData.copperAccount ? (
          <div
            className="switch-subaccout"
            onClick={() => {
              history.push("/home/subAccount");
              props.onCloseModel(false);
            }}
          >
            <div>
              {props.intl.formatMessage({ id: "subaccount_management" })}
            </div>
          </div>
        ) : null}
      </Loadding>
    </Modal>
  );
}
const mapStateToProps = (state: IPropsState) => {
  return {
    subAccounts: state.subAccounts,
    accountName: state.accountName,
    users: state.users,
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setAccountName(data: string) {
      dispatch(setAccountName(data));
    },
    setUser(data: Iusers) {
      dispatch(setUser(data));
    },
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SwitchSubAccout));
