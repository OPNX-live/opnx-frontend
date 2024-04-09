import React, { useEffect, useReducer, useState } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button, Form, Select, message, Checkbox } from "antd";
import close from "assets/image/modal_close.png";
import { allCoin, saveWithdrawAddress, getNetwork } from "service/http/http";
import { messageError, localStorage } from "utils";
import network from "assets/image/network-icon.png";

import AddreddWhileVerify from "components/addreddWhileVerify/addreddWhileVerify";
import "./createaddressmodal.scss";
import TwoFAModal from "scenes/home/scenes/dashboard/components/TwoFAModal/TwoFAModal";
import { injectIntl, WrappedComponentProps } from "react-intl";

const { Option } = Select;
interface ItfaValidationProps {
  visable: boolean;
  onCloseModel: (off: boolean) => void;
  callBack: (success: boolean) => void;
}
interface ItfaProps {
  dashboardUserData: IDashboardUserData;
}

interface IState {
  loading: boolean;
  instrumentId: string;
  walletLabel: string;
  address: string;
  coinOptions: string[];
  isWhiteList: boolean;
  tfa: boolean;
  isTwoFAModal: boolean;
  isAddress: boolean;
  coinNetWorks: [];
  isMemo: boolean;
  memo: string;
}

function CreateAddressModal(
  props: ItfaValidationProps & ItfaProps & WrappedComponentProps
) {
  const [form] = Form.useForm();
  const [, forceUpdate] = useState();
  const [forget, forgetDispatch] = useReducer(
    (state: IState, action: any) => {
      switch (action.type) {
        case "instrumentId":
          return { ...state, instrumentId: action.instrumentId };
        case "address":
          return { ...state, address: action.address };
        case "walletLabel":
          return { ...state, walletLabel: action.walletLabel };
        case "loading":
          return { ...state, loading: action.loading };
        case "coinOptions":
          return { ...state, coinOptions: action.coinOptions };
        case "isWhiteList":
          return { ...state, isWhiteList: action.isWhiteList };
        case "tfa":
          return { ...state, tfa: action.tfa };
        case "isTwoFAModal":
          return { ...state, isTwoFAModal: action.isTwoFAModal };
        case "isAddress":
          return { ...state, isAddress: action.isAddress };
        case "coinNetWorks":
          return { ...state, coinNetWorks: action.coinNetWorks };
        case "isNetWork":
          return { ...state, isNetWork: action.isNetWork };
        case "memo":
          return { ...state, memo: action.memo };
        case "isMemo":
          return { ...state, isMemo: action.isMemo };
        default:
          return state;
      }
    },
    {
      coinNetWorks: [],
      loading: false,
      instrumentId: "",
      walletLabel: "",
      address: "",
      coinOptions: [],
      isWhiteList: false,
      tfa: false,
      isTwoFAModal: false,
      isAddress: false,
      isNetWork: false,
      isMemo: false,
      memo: "",
    }
  );
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  const isCheck = (e: any) => {
    forgetDispatch({ type: "isWhiteList", isWhiteList: !forget.isWhiteList });
  };
  const onTfa = () => {
    if (props.dashboardUserData.enableTfa) {
      forgetDispatch({
        type: "tfa",
        tfa: true,
      });
    } else {
      forgetDispatch({ type: "isTwoFAModal", isTwoFAModal: true });
    }
  };
  const getCoinNetwork = (coin: string) => {
    forgetDispatch({ type: "coinNetWorks", coinNetWorks: [] });

    getNetwork(coin).then((res) => {
      if (res.data) {
        const newWorkList = [];
        res?.data?.forEach((item: any, index: any) => {
          if (item.isWithdrawal) {
            newWorkList.push({
              value: onNetWorkItem(item.netWorks).join(),
              hasTwoPartAddress: item.hasTwoPartAddress,
              isCheck: false,
            });
          }
        });
        if (newWorkList.length) {
          newWorkList[0].isCheck = true;
          if (newWorkList[0].hasTwoPartAddress) {
            forgetDispatch({ type: "isMemo", isMemo: true });
          } else {
            forgetDispatch({ type: "isMemo", isMemo: false });
          }
        }
        forgetDispatch({ type: "coinNetWorks", coinNetWorks: newWorkList });
      }
    });
  };
  const onNetWorkItem = (netWorks: any) => {
    return netWorks && netWorks.length
      ? netWorks.map((item: any) => item.network)
      : [];
  };
  const onFinish = (values: any) => {
    if (forget.isWhiteList) {
      onTfa();
    } else {
      onSave();
    }
  };
  const onNetWork = (value: any) => {
    let arrs = [];
    arrs = forget.coinNetWorks?.map((item: any) => {
      if (item.value === value) {
        forgetDispatch({ type: "isMemo", isMemo: item.hasTwoPartAddress });
        return {
          ...item,
          isCheck: true,
        };
      } else {
        return {
          ...item,
          isCheck: false,
        };
      }
    });

    forgetDispatch({ type: "coinNetWorks", coinNetWorks: arrs });
  };
  const onSave = (tfa?: string, emailCode?: string) => {
    const net = forget?.coinNetWorks?.filter((item: any) => item.isCheck)[0];
    console.log(forget)
    if (net.value) {
      forgetDispatch({
        type: "loading",
        loading: true,
      });
      saveWithdrawAddress({
        instrumentId: forget.instrumentId,
        address: forget.address,
        walletLabel: forget.walletLabel,
        tfaCode: forget.walletLabel ? tfa : undefined,
        isWhiteList: forget.isWhiteList,
        network: net.value,
        tag: net.hasTwoPartAddress ? forget.memo : undefined,
        emailCode: emailCode!,
      }).then((res: any) => {
        forgetDispatch({
          type: "loading",
          loading: false,
        });
        if (res.code === "0000") {
          localStorage.set("time", null);
          message.success(
            props.intl.formatMessage({
              id: "success",
              defaultMessage: "success",
            })
          );
          props.callBack(true);
        } else {
          message.error(res.message);
        }
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {};

  useEffect(() => {
    allCoin(props.dashboardUserData.tradingType).then((res) => {
      if (res.code === "0000") {
        forgetDispatch({ type: "coinOptions", coinOptions: res.data });
      } else {
        message.warning(res.message);
      }
    });
    // @ts-ignore
    forceUpdate({});
  }, [props.dashboardUserData.tradingType]);

  return (
    <Modal
      className="createaddressmodal-model"
      visible={props.visable}
      footer={null}
      maskClosable={false}
      onCancel={handleCancel}
      width={388}
      closeIcon={<img width={10} alt="close" src={close} />}
    >
      <div className="tfa">
        <div className="tfa-top">
          <div className="tfa-title">
            {props.intl.formatMessage({
              id: "Add_Withdrawal_Address",
            })}
          </div>
        </div>
        <Form
          form={form}
          layout={"vertical"}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label={props.intl.formatMessage({
              id: "Coin",
            })}
            name="coin"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              maxTagCount={1}
              style={{ width: "340px" }}
              getPopupContainer={(triggerNode) => triggerNode}
              placeholder={props.intl.formatMessage({ id: "Please_select" })}
              className="status-select"
              onChange={(e: any) => {
                getCoinNetwork(e);
                forgetDispatch({
                  type: "instrumentId",
                  instrumentId: e,
                });
              }}
            >
              {forget.coinOptions.map((res: any) => (
                <Option key={res} value={res}>
                  {res}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={props.intl.formatMessage({
              id: "Network",
            })}
            // name="network1"
          >
            <div className="network-content">
              {forget.coinNetWorks?.length
                ? forget.coinNetWorks?.map((item: any, index: any) => {
                    return item.isCheck ? (
                      <div
                        key={item.value}
                        className={"network-title network-title-active"}
                      >
                        <span>{item.value}</span>
                        <img
                          className="active-icon"
                          src={network}
                          alt="network"
                        />
                      </div>
                    ) : (
                      <div
                        key={item.value}
                        className={"network-title"}
                        onClick={() => onNetWork(item.value)}
                      >
                        {item.value}
                      </div>
                    );
                  })
                : "--"}
            </div>
          </Form.Item>

          <Form.Item
            label={props.intl.formatMessage({
              id: "Wallet_Label",
            })}
            name="network"
            rules={[
              {
                pattern: /^([a-zA-Z\u4e00-\u9fa5a-z\d_. /]{4,20})$/gi,
                message: props.intl.formatMessage({ id: "value_error" }),
              },
              {
                required: true,
                message: props.intl.formatMessage({ id: "value_error" }),
              },
            ]}
          >
            <Input
              placeholder={props.intl.formatMessage({ id: "Wallet_Label" })}
              onChange={(e) => {
                forgetDispatch({
                  type: "walletLabel",
                  walletLabel: e.target.value,
                });
              }}
            />
          </Form.Item>
          <Form.Item
            label={props.intl.formatMessage({
              id: "Address",
            })}
            name="address"
            rules={[
              {
                required: true,
                message: props.intl.formatMessage({
                  id: "PleaseAddress",
                  defaultMessage: "Please enter your address",
                }),
              },
              // { required: true, message: 'Please enter your address' },
            ]}
          >
            <Input
              placeholder={props.intl.formatMessage({
                id: "Address",
              })}
              onChange={(e) => {
                forgetDispatch({ type: "address", address: e.target.value });
              }}
            />
          </Form.Item>
          {forget.isMemo && (
            <Form.Item
              label={props.intl.formatMessage({
                id: "Memo",
              })}
              name="Memo"
              rules={[
                {
                  required: true,
                  message: props.intl.formatMessage({
                    id: "PleaseMemo",
                    defaultMessage: "Please enter your Memo",
                  }),
                },
                {
                  pattern: /^[0-9]*$/,
                  message: props.intl.formatMessage({
                    id: "PleaseNumber",
                    defaultMessage: "Please enter number",
                  }),
                },
              ]}
            >
              <Input
                placeholder={props.intl.formatMessage({ id: "memo" })}
                maxLength={32}
                onChange={(e) => {
                  forgetDispatch({ type: "memo", memo: e.target.value });
                }}
              />
            </Form.Item>
          )}

          <Form.Item noStyle>
            <Checkbox onChange={isCheck} />
            {"  "}
            <span style={{ color: "#333333" }}>
              {" "}
              {props.intl.formatMessage({
                id: "Add_to_Whitelist",
              })}
            </span>
          </Form.Item>
          <Form.Item shouldUpdate={true}>
            <Button
              className="modal-btn-gradient address-btn"
              loading={forget.loading}
              type="primary"
              htmlType="submit"
              disabled={
                !form.isFieldsTouched(true) ||
                form.getFieldsError().filter(({ errors }) => errors.length)
                  .length > 0
              }
            >
              {props.intl.formatMessage({
                id: "Submit",
              })}
            </Button>
          </Form.Item>
        </Form>
        {forget.tfa ? (
          <AddreddWhileVerify
            visable={forget.tfa}
            btnLoading={forget.loading ? 1 : 0}
            onCloseModel={(e: any) => {
              forgetDispatch({
                type: "tfa",
                tfa: e,
              });
            }}
            callBack={(e: any, emailCode: string) => {
              onSave(e, emailCode);
            }}
          />
        ) : null}
      </div>
      {forget.isTwoFAModal ? (
        <TwoFAModal
          visible={forget.isTwoFAModal}
          handlerCallback={() => {
            forgetDispatch({ type: "isTwoFAModal", isTwoFAModal: false });
          }}
        />
      ) : null}
    </Modal>
  );
}
const mapStateToProps = (state: ItfaProps) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(CreateAddressModal));
