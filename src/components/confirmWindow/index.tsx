import React, { useContext, useMemo, useState } from "react";
import { Modal, message, Button } from "antd";
import { connect } from "react-redux";
import { ContainerContext } from "../../scenes/home/scenes/subaccout/subaccout";
import { accoutDelete, changeAccout, geetestInit } from "service/http/http";
import messageError from "utils/errorCode";
import { Convert } from "./data";
import { setAccoutList } from "store/actions/publicAction";
import { injectIntl, WrappedComponentProps } from "react-intl";
import "./index.scss";
import { geetestValidatePackage } from "utils";
import gt from "utils/gt";
import { onRecaptchaVerify } from "@opnx-pkg/uikit";
type INamePropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps> &
  INamePropsState;
interface IConfirmWindowState {
  onCloseModel: (off: boolean) => void;
}
function ConfirmWindow(
  props: IConfirmWindowState & INameDispatchState & WrappedComponentProps
) {
  const value = useContext(ContainerContext);
  const [loadding, setLoadding] = useState<boolean>(false);
  const windowState = useMemo(() => {
    return value.windowState;
  }, [value.windowState]);
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  const subInterface = (token: string, action: string) => {
    const Windowsdata = {
      accountName: "",
      _key: value.accoutListIndex._key,
      tradingType: null,
      accountStatus: Convert(value.accoutListIndex.accountStatus),
    };
    changeAccout(Windowsdata,token,action)
      .then((res) => {
        props.onCloseModel(false);
        setLoadding(false);
        if (res.success) {
          if (value.accoutListIndex.accountStatus === "ACTIVE") {
            message.success(props.intl.formatMessage({ id: "freeze_success" }));
          } else {
            message.success(
              props.intl.formatMessage({ id: "Unfreeze_success" })
            );
          }
          props.setAccoutList(true);
          return;
        }
        message.warning(res.message);
      })
      .catch(() => setLoadding(false));
  };
  // const handler = (obj: object) => {
  //   const data = {
  //     email: props.users.email,
  //     geetestType: "COMMON",
  //   };
  //   geetestValidatePackage(
  //     obj,
  //     data,
  //     () => {
  //       subInterface();
  //     },
  //     () => {
  //       setLoadding(false);
  //     }
  //   );
  // };
  const handleConfirm = async () => {
    setLoadding(true);
    if (value.title === "Confirm Delete") {
      accoutDelete(value.accoutListIndex._key).then((res) => {
        props.onCloseModel(false);
        setLoadding(false);
        if (res.success) {
          message.success(props.intl.formatMessage({ id: "delete_success" }));
          props.setAccoutList(true);
          return;
        }
        message.warning(res.message);
      });
    } else {
      onRecaptchaVerify(
        "",
        "COMMON",
        (token, action) => {
          setLoadding(false);
          subInterface(token, action);
        },
        () => setLoadding(false)
      );
    }
  };
  const title = () => {
    if (
      value.accoutListIndex.accountStatus === "FREEZE" &&
      value.title !== "Confirm Delete"
    ) {
      return props.intl.formatMessage({ id: "account_model_unfreeze" });
    } else if (value.title === "Confirm Delete") {
      return props.intl.formatMessage({ id: "account_model_delete" });
    } else if (value.title === "Confirm freeze") {
      return props.intl.formatMessage({ id: "account_model_freeze" });
    }
  };
  return (
    <Modal
      className="confirm-window"
      title={title()}
      visible={windowState}
      closable={false}
      footer={
        <div className="footer-div">
          <Button type="primary" className="cancel" onClick={handleCancel}>
            {props.intl.formatMessage({ id: "cancel" })}
          </Button>
          <Button
            loading={loadding}
            type="primary"
            className="ok"
            onClick={handleConfirm}
          >
            {value.title === "Confirm Delete" ||
            value.accoutListIndex.accountStatus === "FREEZE"
              ? props.intl.formatMessage({ id: "Confirm" })
              : props.intl.formatMessage({ id: "ok" })}
          </Button>
        </div>
      }
      // onOk={this.handleOk}
      onCancel={handleCancel}
    >
      <div className="window-message">
        {value.title === "Confirm Delete"
          ? props.intl.formatMessage({ id: "account_type_delete" })
          : value.accoutListIndex.accountStatus === "FREEZE"
          ? props.intl.formatMessage({ id: "account_type_freeze" })
          : props.intl.formatMessage({ id: "account_type_disable" })}
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: { users: Iusers }) => {
  return {
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setAccoutList(data: any) {
      dispatch(setAccoutList(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ConfirmWindow));
