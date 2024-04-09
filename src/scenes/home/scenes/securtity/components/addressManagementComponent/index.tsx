import React, { useState, memo } from "react";
import { connect } from "react-redux";
import { Tooltip, Switch, Button } from "antd";
import { WrappedComponentProps, injectIntl } from "react-intl";
import history from "router/history";
import WhiteListModal from "../whiteListModal/WhiteListModal";
import "./index.scss";

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = { setIsWhitetfa: Function; callBack: Function };
type TProps = TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps;

const AddressManagementComponent = memo((props: TProps) => {
  const [isWhiteListModal, setIsWhiteListModal] = useState(false);
  const onCallBack = (e: any) => {
    if (!props.dashboardUserData.enableTfa) {
      props.setIsWhitetfa(true);
      setIsWhiteListModal(false);
    } else {
      setIsWhiteListModal(false);
      props.callBack(true);
    }
  };
  return (
    <div className="address-management-component">
      <div
        className="cart-item address-management"
        style={{ minHeight: "103px" }}
      >
        <div className="kyc-level">
          <div>
            <div className="kyc-level-addressManagement">
              {props.intl.formatMessage({
                id: "Address_Management",
                defaultMessage: "Address Management",
              })}
            </div>
          </div>
          <div className="title whitelist-off">
            <div className="whitelist-off-content">
              <Tooltip
                title={props.intl.formatMessage({
                  id: "Whitelist_Title",
                  defaultMessage:
                    "When this function is turned on, your account will only be able to withdraw to whitelisted withdrawal addresses. When this function is turned off, your account is able to withdraw to any withdrawal address.",
                })}
                placement="bottom"
                getPopupContainer={(triggerNode) => triggerNode}
                trigger="click"
              >
                <div className="whitelist-off-title">
                  {props.dashboardUserData.enableWithdrawalWhiteList
                    ? props.intl.formatMessage({
                        id: "Whitelist_On",
                        defaultMessage: "Whitelist On",
                      })
                    : props.intl.formatMessage({
                        id: "Whitelist_Off",
                        defaultMessage: "Whitelist Off",
                      })}
                </div>
              </Tooltip>
              <Switch
                checked={props.dashboardUserData.enableWithdrawalWhiteList}
                onChange={(e) => {
                  setIsWhiteListModal(true);
                }}
              />
            </div>
            <Button
              className="active"
              onClick={() => {
                history.push("/home/security/addressManagement");
              }}
            >
              {props.intl.formatMessage({
                id: "Manage",
                defaultMessage: "Manage",
              })}
            </Button>
          </div>
        </div>
        <div className="withdrawal-limit" style={{ paddingRight: "67px" }}>
          {props.intl.formatMessage({
            id: "Address_Management_Describe",
            defaultMessage:
              "Address Management allows you to save and label your withdrawal addresses.",
          })}
        </div>
      </div>
      {isWhiteListModal ? (
        <WhiteListModal
          type={
            props.dashboardUserData.enableWithdrawalWhiteList
              ? "CloseWhiteList"
              : "EnableWhiteList"
          }
          visible={isWhiteListModal}
          handleCloseModal={() => {
            setIsWhiteListModal(false);
          }}
          Callback={onCallBack}
        />
      ) : null}
    </div>
  );
});

const mapStateToProps = (state: IGlobalT) => ({
  dashboardUserData: state.dashboardUserData,
  users: state.users,
});

const mapDispatchToProps = (dispatch: TDispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AddressManagementComponent));
