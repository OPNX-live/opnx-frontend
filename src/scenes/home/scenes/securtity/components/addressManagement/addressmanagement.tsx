import React, { Component } from "react";
import { connect } from "react-redux";
import { IAddressManagementStates, IAddressManagementResult } from "./type";
import {
  Row,
  Input,
  Button,
  Table,
  Pagination,
  Modal,
  Switch,
  Tooltip,
  Checkbox,
  message,
} from "antd";
import history from "router/history";
import { ColumnsType } from "antd/lib/table";
import {
  getAddress,
  deleteAddress,
  switchWhiteList,
  addWhiteAddress,
  removeWhiteAddress,
} from "service/http/http";
import { EnumWithdrawCoin } from "schemas/index.enum";
import CreateAddressModal from "../createAddressModal/createaddressmodal";
import QRCode from "qrcode.react";
import { Loadding } from "components/loadding";
import AddreddWhileVerify from "components/addreddWhileVerify/addreddWhileVerify";

import "./addressmanagement.scss";
import ewm from "assets/image/ewm.svg";
import { TableNoData } from "components/publicComponent/publicComponent";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { setDashboardUserData } from "store/actions/publicAction";
import { messageError, localStorage } from "utils";
import WhiteListModal from "../whiteListModal/WhiteListModal";
import TwoFAModal from "scenes/home/scenes/dashboard/components/TwoFAModal/TwoFAModal";
import WhiteListed from "assets/image/whiteListed.svg";
import NoWhiteListed from "assets/image/noWhiteListed.svg";
import { WrappedComponentProps, injectIntl } from "react-intl";

type IAddressManagementPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IAddressManagementDispatchState = ReturnType<typeof mapDispatchToProps>;
type IAddressManagementProps = IAddressManagementPropsState &
  IAddressManagementDispatchState;

class AddressManagement extends Component<
  IAddressManagementProps,
  IAddressManagementStates
> {
  readonly state: IAddressManagementStates = {
    tfaType: null,
    whiteListType: "OpenWhiteList",
    whiteListVisible: false,
    tfaOpenisible: false,
    tfaVisable: false,
    isVisable: false,
    btnLoading: false,
    loading: 0,
    visable: false,
    params: {
      pageNum: 1,
      pageSize: 10,
      searchParams: "",
      isSearchWhiteList: false,
    },
    initResult: [], // 初始数据
    result: [], // 搜索数据
    data: [], // 渲染数据
    deleteList: [],
    deleteStr: "",
    selectRow: {},
    selectDels: [],
    isDelAll: false,
  };
  coin: { [key: string]: string } = EnumWithdrawCoin;

  columns: ColumnsType<IAddressManagementResult> = [
    {
      key: "coin",
      title: this.props.intl.formatMessage({
        id: "Coin",
      }),
      dataIndex: "instrumentId",
      render: (r: string, row: any) => {
        return <div>{`${r ?? ""}${row.network ?? ""}`}</div>;
      },
    },
    {
      key: "walletLabel",
      title: this.props.intl.formatMessage({
        id: "Wallet_Label",
      }),
      dataIndex: "walletLabel",
      render: (r: string) => {
        return (
          <div
            style={{
              width: "96px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r}
          </div>
        );
      },
    },
    {
      key: "address",
      title: this.props.intl.formatMessage({
        id: "Address",
      }),
      dataIndex: "address",
      render: (r: string) => {
        return (
          <div style={{ display: "inline-flex", alignItems: "center" }}>
            <span>{r}</span>
            <div className="iconQr">
              <img src={ewm} alt="ewm" />
              <div className="iconQr-hover">
                <div className="iconQr-hover-box">
                  <QRCode value={r} style={{ width: "95px", height: "95px" }} />
                </div>
                <div className="iconQr-hover-arrow"></div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "tag",
      title: "Memo Tag",
      dataIndex: "tag",
      render: (item) => (item !== "" && item !== null ? item : "--"),
    },
    {
      key: "isWhiteList",
      title: "Whitelist",
      dataIndex: "isWhiteList",
      render: (r: boolean, item: IAddressManagementResult) => {
        return (
          <Tooltip
            title={
              r
                ? this.props.intl.formatMessage({ id: "Whitelisted" })
                : this.props.intl.formatMessage({ id: "Not Whitelisted" })
            }
            placement="bottom"
            overlayClassName="white"
          >
            <img
              src={r ? WhiteListed : NoWhiteListed}
              alt={r ? "Whitelisted" : "Not Whitelisted"}
              onClick={() => {
                this.setState({
                  deleteStr:
                    item.instrumentId +
                    "-" +
                    item.address +
                    "-" +
                    item.network +
                    "-" +
                    item.tag,
                });
                if (this.props.dashboardUserData.enableWithdrawalWhiteList) {
                  if (r) {
                    this.setState({
                      whiteListType: "DeleteWhiteList",
                      whiteListVisible: true,
                      // deleteStr: item.address,
                    });
                  } else {
                    // this.setState({
                    //   whiteListType: "",
                    //   whiteListVisible: true,
                    //   deleteStr: item.address,
                    // });
                    if (this.props.dashboardUserData.enableTfa) {
                      this.setState({
                        tfaVisable: true,
                        tfaType: "add",
                      });
                    } else {
                      this.setState({
                        tfaOpenisible: true,
                      });
                    }
                  }
                } else {
                  this.setState({
                    whiteListVisible: true,
                    // deleteStr: item.address,
                    whiteListType: "OpenWhiteList",
                  });
                }
                // }
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      key: "action",
      title: null,
      dataIndex: "Action",
      render: (e, item: IAddressManagementResult) => {
        return (
          <div
            style={{ color: "#318BF5", cursor: "pointer" }}
            onClick={() => {
              this.setState({
                selectRow: item,
                deleteStr:
                  item.instrumentId + "-" + item.address + "-" + item.network,
                isVisable: true,
                isDelAll: false,
              });
            }}
          >
            Delete
          </div>
        );
      },
    },
  ];
  constructor(props: IAddressManagementProps) {
    super(props);
    this.getAddressList = this.getAddressList.bind(this);
    this.Modal = this.Modal.bind(this);
  }

  // 分页
  paginationChange() {
    const data = this.state.result.filter(
      (p: IAddressManagementResult, i: number) => {
        if (this.state.params.pageSize >= this.state.result.length) {
          this.setState({ params: { ...this.state.params, pageNum: 1 } });
          return i < this.state.params.pageSize;
        } else {
          return (
            this.state.params.pageNum * this.state.params.pageSize -
              this.state.params.pageSize <=
              i && i < this.state.params.pageNum * this.state.params.pageSize
          );
        }
      }
    );
    if (!data.length && this.state.params.pageNum) {
      this.setState(
        {
          params: {
            ...this.state.params,
            pageNum: this.state.params.pageNum - 1,
          },
        },
        () => {
          this.paginationChange();
        }
      );
    } else {
      this.setState({ data });
    }
  }

  // 搜索
  search() {
    const searchResult = this.state.initResult.filter(
      (p: IAddressManagementResult) => {
        if (
          this.state.params.searchParams &&
          this.state.params.isSearchWhiteList
        ) {
          return (
            p.instrumentId.indexOf(this.state.params.searchParams) > -1 &&
            p.isWhiteList
          );
        }
        if (
          this.state.params.searchParams &&
          !this.state.params.isSearchWhiteList
        ) {
          return p.instrumentId.indexOf(this.state.params.searchParams) > -1;
        }
        if (
          !this.state.params.searchParams &&
          this.state.params.isSearchWhiteList
        ) {
          return p.isWhiteList;
        }
        return true;
      }
    );
    this.setState(
      {
        result: searchResult,
        params: {
          ...this.state.params,
          pageNum:
            searchResult.length && !this.state.params.pageNum
              ? 1
              : this.state.params.pageNum,
        },
      },
      () => {
        this.paginationChange();
      }
    );
  }

  async getAddressList() {
    this.setState({ loading: 1 });
    const result = await getAddress();
    result.success &&
      this.setState(
        {
          initResult: result.data.map((r: any) => ({
            ...r,
            id:
              r.instrumentId + "-" + r.address + "-" + r.network + "-" + r.tag,
          })),
        },
        () => {
          this.search();
        }
      );
    !result.success && message.warning(result.message);
    this.setState({ loading: 0 });
  }

  async deleteAddress() {
    this.setState({ btnLoading: true });
    const { selectRow, selectDels, isDelAll } = this.state;
    const arr = !isDelAll
      ? [
          {
            instrumentId: selectRow.instrumentId,
            network: selectRow.network,
            address: selectRow.address,
            tag: selectRow.tag,
          },
        ]
      : selectDels;
    const result = await deleteAddress(arr);
    result.success &&
      result.code &&
      this.setState(
        {
          deleteList: [],
          selectRow: {},
          selectDels: [],
          isDelAll: false,
          deleteStr: "",
          btnLoading: false,
          isVisable: false,
        },
        () => {
          this.getAddressList();
        }
      );
  }
  componentDidMount() {
    if (
      this.props.dashboardUserData &&
      this.props.dashboardUserData.accountSource === "METAMASK" &&
      !this.props.dashboardUserData.bindEmail
    ) {
      history.push("/home");
    } else {
      this.getAddressList();
    }
  }
  componentWillUnmount() {
    this.setState = () => {
      return false;
    };
  }

  async openWhiteList(code: string, emailCode: string) {
    switchWhiteList(
      !this.props.dashboardUserData.enableWithdrawalWhiteList,
      code,
      emailCode
    )
      .then((result) => {
        this.setState({ loading: 0 });
        if (result.success) {
          this.setState({ tfaVisable: false });
          localStorage.set("time", null);
          this.props.setDashboardUserData({
            ...this.props.dashboardUserData,
            enableWithdrawalWhiteList:
              !this.props.dashboardUserData.enableWithdrawalWhiteList,
          });
          this.getAddressList();
        } else {
          message.warn(messageError(result.message));
        }
      })
      .catch((l) => {
        this.setState({ loading: 0 });
        message.warn(messageError(l.code));
      });
  }
  async addWhiteList(code: string, emailCode: string) {
    const result = await addWhiteAddress(
      this.state.deleteStr ? [this.state.deleteStr] : this.state.deleteList,
      code,
      emailCode
    );
    this.setState({ tfaVisable: false });
    result.success && localStorage.set("time", null);
    result.success &&
      this.setState(
        { deleteList: [], selectRow: {}, selectDels: [], deleteStr: "" },
        () => {
          this.getAddressList();
        }
      );
    this.setState({ loading: 0 });
    !result.success && message.warn(messageError(result.message));
  }
  async removeWhiteList() {
    this.setState({ loading: 1, whiteListVisible: false });
    const result = await removeWhiteAddress(
      this.state.deleteStr ? [this.state.deleteStr] : this.state.deleteList
    );
    result.success &&
      this.setState(
        { deleteList: [], selectRow: {}, selectDels: [], deleteStr: "" },
        () => {
          this.getAddressList();
        }
      );
    !result.success && message.warn(messageError(result.message));
    this.setState({ loading: 0 });
  }

  Modal() {
    const { loading } = this.state;
    return (
      <>
        {/* tfa输入 */}
        {this.state.tfaVisable && (
          <AddreddWhileVerify
            visable={this.state.tfaVisable}
            btnLoading={loading}
            onCloseModel={(tfaVisable: boolean) => {
              this.setState({ tfaVisable, tfaType: null });
            }}
            callBack={async (code, emailCode) => {
              this.setState({ loading: 1 });
              if (this.state.tfaType) {
                this.addWhiteList(code, emailCode);
              } else {
                this.openWhiteList(code, emailCode);
              }
            }}
          />
        )}

        {/* 白名单提示 */}
        <WhiteListModal
          type={this.state.whiteListType}
          visible={this.state.whiteListVisible}
          handleCloseModal={(whiteListVisible: boolean) => {
            this.setState({ whiteListVisible });
          }}
          Callback={(e) => {
            switch (this.state.whiteListType) {
              case "DeleteWhiteList":
                this.removeWhiteList();
                break;

              default:
                if (this.props.dashboardUserData.enableTfa) {
                  this.setState({
                    whiteListVisible: false,
                    tfaVisable: true,
                  });
                } else {
                  this.setState({
                    whiteListVisible: false,
                    tfaOpenisible: true,
                  });
                }
                break;
            }
          }}
        />
        {/* tofa开启 */}
        <TwoFAModal
          visible={this.state.tfaOpenisible}
          handlerCallback={(tfaOpenisible: boolean) => {
            this.setState({ tfaOpenisible });
          }}
        />
      </>
    );
  }
  render() {
    return (
      <Loadding show={this.state.loading}>
        <this.Modal />
        <Row className="cf-address">
          <Row className="c-a-breadcrumb">
            <Row
              onClick={() => {
                history.push("/home/security");
              }}
            >
              {this.props.intl.formatMessage({
                id: "Security",
              })}
            </Row>
            <Row style={{ padding: "0 8px" }}>/</Row>
            <Row>
              {this.props.intl.formatMessage({
                id: "AddressManagement",
                defaultMessage: "Address Management",
              })}
            </Row>
          </Row>

          <Row className="c-a-title">
            <Row>
              {this.props.intl.formatMessage({
                id: "AddressManagement",
              })}
            </Row>
            <Row>
              <Tooltip
                title={this.props.intl.formatMessage({
                  id: "AddressWhitelist",
                })}
                placement="bottom"
                getPopupContainer={(triggerNode) => triggerNode}
              >
                <span>
                  {this.props.dashboardUserData.enableWithdrawalWhiteList
                    ? this.props.intl.formatMessage({
                        id: "Whitelist_On",
                      })
                    : this.props.intl.formatMessage({
                        id: "Whitelist_Off",
                      })}
                </span>
              </Tooltip>
              <Switch
                checked={this.props.dashboardUserData.enableWithdrawalWhiteList}
                onChange={(e: boolean) => {
                  this.setState({
                    whiteListType: e ? "EnableWhiteList" : "CloseWhiteList",
                    whiteListVisible: true,
                  });
                }}
              />
              <Button
                type="text"
                onClick={() => {
                  this.setState({ visable: true });
                }}
              >
                {this.props.intl.formatMessage({
                  id: "AddAddress",
                })}
              </Button>
            </Row>
          </Row>

          <Row className="c-a-form">
            <Row className="c-a-f-left">
              <Row className="c-a-f-input">
                <Row>
                  {this.props.intl.formatMessage({
                    id: "Coin",
                  })}
                </Row>
                <Input
                  placeholder={this.props.intl.formatMessage({
                    id: "Search_for",
                  })}
                  value={this.state.params.searchParams}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.setState({
                      params: {
                        ...this.state.params,
                        searchParams: e.target.value,
                      },
                    });
                  }}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    e.which === 13 && this.search();
                  }}
                />
              </Row>
              <Checkbox
                checked={this.state.params.isSearchWhiteList}
                disabled={
                  !this.props.dashboardUserData.enableWithdrawalWhiteList
                }
                onChange={(e: CheckboxChangeEvent) => {
                  this.setState(
                    {
                      params: {
                        ...this.state.params,
                        isSearchWhiteList: e.target.checked,
                      },
                    },
                    () => {
                      this.search();
                    }
                  );
                }}
              >
                {this.props.intl.formatMessage({
                  id: "Only_display_whitelisted_addresses",
                })}
              </Checkbox>
            </Row>
            <Row className="c-a-f-right">
              <Button
                type="text"
                disabled={this.state.deleteList.length ? false : true}
                onClick={() => {
                  if (this.props.dashboardUserData.enableWithdrawalWhiteList) {
                    this.props.dashboardUserData.enableTfa
                      ? this.setState({ tfaVisable: true, tfaType: "add" })
                      : this.setState({ tfaOpenisible: true });
                  } else {
                    this.setState({
                      whiteListType: "OpenWhiteList",
                      whiteListVisible: true,
                    });
                  }
                }}
              >
                {this.props.intl.formatMessage({
                  id: "Add_to_Whitelist",
                })}
              </Button>
              <Button
                type="text"
                disabled={this.state.deleteList.length ? false : true}
                onClick={() => {
                  this.setState({
                    whiteListType: "DeleteWhiteList",
                    whiteListVisible: true,
                  });
                }}
              >
                {this.props.intl.formatMessage({
                  id: "Remove_from_Whitelist",
                })}
              </Button>
              <Button
                type="text"
                disabled={this.state.deleteList.length ? false : true}
                onClick={() => {
                  this.setState({ isVisable: true, isDelAll: true });
                }}
              >
                {this.props.intl.formatMessage({
                  id: "Delete",
                })}
              </Button>
            </Row>
          </Row>
          <Table
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: this.state.deleteList,
              onSelectAll: (isSelect: boolean) => {
                const dataList: string[] = this.state.data.map(
                  (p) =>
                    p.instrumentId +
                    "-" +
                    p.address +
                    "-" +
                    p.network +
                    "-" +
                    p.tag
                );
                const deleteList: string[] = isSelect
                  ? Array.from(new Set(this.state.deleteList.concat(dataList)))
                  : this.state.deleteList.filter(
                      (r: string) => !dataList.some((s: string) => r === s)
                    );

                const dels = isSelect
                  ? this.state.data.map((p: any) => ({
                      instrumentId: p.instrumentId,
                      network: p.network,
                      address: p.address,
                      id: p.id,
                      tag: p.tag,
                    }))
                  : [];
                this.setState({
                  deleteList,
                  selectDels: dels,
                });
              },
              onSelect: (e: IAddressManagementResult, isSelect: boolean) => {
                const deleteList: string[] = isSelect
                  ? Array.from(
                      new Set(
                        this.state.deleteList.concat(
                          e.instrumentId +
                            "-" +
                            e.address +
                            "-" +
                            e.network +
                            "-" +
                            e.tag
                        )
                      )
                    )
                  : this.state.deleteList.filter(
                      (r: string) =>
                        r !==
                        e.instrumentId +
                          "-" +
                          e.address +
                          "-" +
                          e.network +
                          "-" +
                          e.tag
                    );
                const dels = isSelect
                  ? [
                      ...this.state.selectDels,
                      {
                        instrumentId: e.instrumentId,
                        network: e.network,
                        address: e.address,
                        id: e.id,
                        tag: e.tag,
                      },
                    ]
                  : this.state.selectDels.filter((r: any) => r.id !== e.id);
                this.setState({
                  deleteList,
                  selectDels: dels,
                });
              },
            }}
            columns={this.columns}
            dataSource={this.state.data}
            pagination={false}
            rowKey={(rcord: any) => rcord.id}
            locale={{
              emptyText: TableNoData(
                this.props.intl.formatMessage({
                  id: "No_Address",
                })
              ),
            }}
          />
          <Pagination
            style={{ display: this.state.result.length ? "block" : "none" }}
            showSizeChanger={true}
            showQuickJumper={true}
            current={this.state.params.pageNum}
            pageSize={this.state.params.pageSize}
            size={"small"}
            total={this.state.result.length}
            onChange={(pageNum, pageSize) => {
              this.setState(
                {
                  params: {
                    ...this.state.params,
                    pageNum,
                  },
                },
                () => {
                  this.paginationChange();
                }
              );
            }}
            onShowSizeChange={(current, pageSize) => {
              this.setState(
                {
                  params: {
                    ...this.state.params,
                    pageSize,
                  },
                },
                () => {
                  this.paginationChange();
                }
              );
            }}
          />
          {this.state.visable && (
            <CreateAddressModal
              visable={this.state.visable}
              onCloseModel={(e: boolean) => {
                this.setState({ visable: e });
              }}
              callBack={(e: boolean) => {
                this.setState({
                  visable: false,
                });
                e && this.getAddressList();
              }}
            />
          )}
          <Modal
            title={null}
            footer={null}
            visible={this.state.isVisable}
            closable={false}
            className="address-managent-modal"
          >
            <div className="title">
              {this.props.intl.formatMessage({
                id: "account_model_delete",
              })}
            </div>
            <div className="text">
              {this.props.intl.formatMessage({
                id: "After_deleting",
              })}
            </div>
            <div className="footer">
              <Button
                style={{ marginRight: "10px" }}
                type="text"
                onClick={() => {
                  this.setState({ isVisable: false });
                }}
              >
                {this.props.intl.formatMessage({
                  id: "cancel",
                })}
              </Button>
              <Button
                type="primary"
                loading={this.state.btnLoading}
                onClick={() => {
                  this.deleteAddress();
                }}
              >
                {this.props.intl.formatMessage({
                  id: "Confirm",
                })}
              </Button>
            </div>
          </Modal>
        </Row>
      </Loadding>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    dashboardUserData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setDashboardUserData(data: IDashboardUserData) {
      dispatch(setDashboardUserData(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(AddressManagement));
