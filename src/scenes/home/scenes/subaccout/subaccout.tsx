import React, { useReducer, createContext, useEffect } from "react";
import { Table, message, Row, Col } from "antd";
import moment from "moment";
import { imgList, status, AccountStatusColor } from "./data";
import { connect } from "react-redux";
import SubAccountModalCpmonent from "../../../../components/subAccountModalCpmonent/index";
import Models from "../../../../components/index";
import { accoutList } from "../../../../service/http/http";
import { Loadding } from "components/loadding";
import { setAccoutList } from "store/actions/publicAction";
import "./subaccout.scss";
import { TooltipGlobal } from "components/TooltipGlobal/Tooltip";
import history from "router/history";
import borrowEmpty from "assets/image/borrow-empty.png";
import {
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
import { SubAccount } from "assets/image";
import { toThousands } from "utils";
// import Guard from "../../router/guard";
// import isAddress from "utils/isAddress";

interface ISubAccout {
  visible: boolean;
  linearShow: boolean;
  accoutNameShow: boolean;
  windowState: boolean;
  title: string;
  accoutList: IAccoutList[];
  accoutListIndex: any;
  pageNumber: number;
  pageSize: number;
  totalData: number;
}
interface ISubAccoutProps {
  accoutListRefresh: boolean;
  users: any;
}
const suAccoutbState = {
  visible: false,
  linearShow: false,
  accoutNameShow: false,
  windowState: false,
  title: "",
  accoutList: [],
  accoutListIndex: {},
  pageSize: 50,
  pageNumber: 1,
  totalData: 0,
};
export const ContainerContext = createContext<ISubAccout>(suAccoutbState);
type IFirstPropsState = ReturnType<typeof mapStateToProps> & ISubAccoutProps;
type IFirstDispatchState = ReturnType<typeof mapDispatchToProps>;
function SubAccout(
  props: ISubAccoutProps & IFirstDispatchState & WrappedComponentProps
) {
  const [SubAccout, SubAccoutDispatch] = useReducer(
    (state: ISubAccout, action: any) => {
      switch (action.type) {
        case "visible":
          return { ...state, visible: action.visible };
        case "linearShow":
          return { ...state, linearShow: action.linearShow };
        case "accoutNameShow":
          return { ...state, accoutNameShow: action.accoutNameShow };
        case "windowState":
          return { ...state, windowState: action.windowState };
        case "title":
          return { ...state, title: action.title };
        case "accoutList":
          return { ...state, accoutList: action.accoutList };
        case "accoutListIndex":
          return { ...state, accoutListIndex: action.accoutListIndex };
        case "pageSize":
          return { ...state, pageSize: action.pageSize };
        case "pageNumber":
          return { ...state, pageNumber: action.pageNumber };
        case "totalData":
          return { ...state, totalData: action.totalData };
        default:
          return state;
      }
    },
    suAccoutbState
  );
  const colorStatus: { [key: string]: string } = AccountStatusColor;
  const { setAccoutList } = props;
  useEffect(() => {
    let soure: boolean = true;
    accoutList(SubAccout.pageNumber - 1, SubAccout.pageSize).then((res) => {
      if (res.success) {
        if (soure) {
          if (!res.data.data.length && res.data.total > 0) {
            SubAccoutDispatch({
              type: "pageNumber",
              pageNumber: SubAccout.pageNumber - 1,
            });
          } else {
            SubAccoutDispatch({
              type: "accoutList",
              accoutList: res.data.data,
            });
            SubAccoutDispatch({ type: "totalData", totalData: res.data.total });
            setAccoutList(false);
          }
        }
      } else {
        message.warning(res.message);
      }
    });

    return () => {
      soure = false;
    };
  }, [
    props.accoutListRefresh,
    setAccoutList,
    SubAccout.pageNumber,
    SubAccout.pageSize,
  ]);
  const linearShow = (e: any) => {
    const index = JSON.parse(e.target.dataset.index);
    SubAccoutDispatch({ type: "accoutListIndex", accoutListIndex: index });
    const type: string = e.target.dataset.type;
    if (type === "liverse") {
      SubAccoutDispatch({ type: "linearShow", linearShow: true });
      SubAccoutDispatch({ type: "accoutNameShow", accoutNameShow: false });
      return;
    }
    SubAccoutDispatch({ type: "linearShow", linearShow: true });
    SubAccoutDispatch({ type: "accoutNameShow", accoutNameShow: true });
  };
  const columns = [
    {
      title: props.intl.formatMessage({ id: "Account_Name" }),
      className: "accoutName",
      dataIndex: "accountName",
      key: "Name",
      render: (item: string, index: IAccoutList) => (
        <div
          className={`table-accout ${
            index.accountStatus === "FREEZE" ? "table-accout-del" : ""
          }`}
        >
          <TooltipGlobal title={item}>
            {" "}
            <span> {item}</span>
          </TooltipGlobal>
          {index.accountType === "FLEXEARN" ? null : (
            <img
              src={imgList.edit}
              alt="edit"
              onClick={linearShow}
              data-index={JSON.stringify(index)}
              data-type="accoutName"
            />
          )}
        </div>
      ),
    },
    {
      title: "Trading Type",
      dataIndex: "tradingType",
      key: "tradingType",
      render: (item: string, index: IAccoutList) => (
        <div>
          {item
            ? item?.slice(0, 1) + item?.slice(1)?.toLocaleLowerCase()
            : "--"}
        </div>
      ),
    },
    {
      title: props.intl.formatMessage({ id: "Account_Type" }),
      dataIndex: "accountType",
      key: "accountType",
      render: (item: string, index: IAccoutList) => (
        <div
          className={`table-accout ${
            index.accountStatus === "FREEZE" ? "table-accout-del" : ""
          }`}
        >
          {props.intl.formatMessage({ id: status(item) })}
        </div>
      ),
    },
    // {
    //   title: props.intl.formatMessage({ id: "Margin_Type" }),
    //   dataIndex: "tradingType",
    //   key: "tradingType",
    //   render: (item: string, index: IAccoutList) => (
    //     <div
    //       className={`table-accout ${
    //         index.accountStatus === "FREEZE" ? "table-accout-del" : ""
    //       }`}
    //     >
    //       <span>
    //         {item ? props.intl.formatMessage({ id: status(item) }) : ""}
    //       </span>{" "}
    //       {/* {index.accountType === "FLEXEARN" ? null : (
    //         <img
    //           src={imgList.edit}
    //           alt="edit"
    //           onClick={linearShow}
    //           data-type="liverse"
    //           data-index={JSON.stringify(index)}
    //         />
    //       )} */}
    //     </div>
    //   ),
    // },
    {
      title: props.intl.formatMessage({ id: "Status" }),
      dataIndex: "accountStatus",
      key: "accountStatus",
      render: (item: string, index: IAccoutList) => (
        <div
          className={`table-accout table-status ${
            index.accountStatus === "FREEZE" ? "table-accout-del" : ""
          }`}
        >
          <span style={{ background: colorStatus[status(item)] }}></span>{" "}
          <span>{props.intl.formatMessage({ id: status(item) })}</span>
        </div>
      ),
    },
    {
      title: props.intl.formatMessage({ id: "Email" }),
      dataIndex: "accountEmail",
      key: "accountEmail",
      render: (item: string, index: IAccoutList) => (
        <div
          className={`${
            index.accountStatus === "FREEZE" ? "table-accout-del" : ""
          }`}
        >
          {item}
        </div>
      ),
    },
    {
      title: props.intl.formatMessage({ id: "Creation_Time" }),
      dataIndex: "createdDate",
      key: "createdDate",
      render: (item: number, index: IAccoutList) => (
        <div
          className={`register-time ${
            index.accountStatus === "FREEZE" ? "table-accout-del" : ""
          }`}
        >
          {moment(item).format("YYYY-MM-DD HH:mm")}
        </div>
      ),
    },
    {
      title: props.intl.formatMessage({ id: "Actions" }),
      dataIndex: "address",
      key: "address",
      className: "actionName",
      width: 150,
      render: (item: any, index: IAccoutList) => (
        <div className="table-action">
          <span
            onClick={() => {
              (index.accountStatus === "FREEZE" ||
                index.accountStatus === "ACTIVE") &&
                history.replace({
                  pathname: "/home/walletManagement/transfer",
                  state: { accountId: index._key },
                });
            }}
            style={{
              color:
                index.accountStatus === "FREEZE" ||
                index.accountStatus === "ACTIVE"
                  ? ""
                  : "rgba(229, 223, 245, .3)",
            }}
          >
            {props.intl.formatMessage({ id: "Transfer" })}
          </span>
          <span onClick={confirmWindow} data-index={JSON.stringify(index)}>
            {index.accountStatus === "ACTIVE"
              ? props.intl.formatMessage({ id: "Freeze" })
              : props.intl.formatMessage({ id: "Unfreeze" })}
          </span>
        </div>
      ),
    },
  ];
  const addShow = (record: IAccoutList) => {
    SubAccoutDispatch({ type: "windowState", windowState: true });
    SubAccoutDispatch({ type: "title", title: "Confirm Delete" });
    SubAccoutDispatch({ type: "accoutListIndex", accoutListIndex: record });
  };
  const confirmWindow = (event: any) => {
    const data = JSON.parse(event.target.dataset.index);
    if (data.accountStatus === "FREEZE" || data.accountStatus === "ACTIVE") {
      SubAccoutDispatch({ type: "windowState", windowState: true });
      SubAccoutDispatch({ type: "title", title: "Confirm freeze" });
      SubAccoutDispatch({
        type: "accoutListIndex",
        accoutListIndex: data,
      });
    } else {
      message.warning(
        props.intl.formatMessage(
          { id: "accountStatus" },
          { status: status(data.accountStatus) }
        )
        // `The account has been set to ${status(
        //   data.accountStatus
        // )} and cannot be unfrozen. If you have any questions, please contact customer service`
      );
    }
  };
  const onCloseModal = (e: boolean) => {
    SubAccoutDispatch({ type: "visible", visible: false });
  };
  const itemRender = (current: any, type: any, originalElement: any) => {
    if (type === "prev") {
      return <img alt="prev" src={imgList.prev} />;
    }
    if (type === "next") {
      return <img alt="next" src={imgList.next} />;
    }
    return originalElement;
  };
  const onClose = (e: boolean) => {
    SubAccoutDispatch({ type: "linearShow", linearShow: e });
  };
  const onCloseWinddow = (e: boolean) => {
    SubAccoutDispatch({ type: "windowState", windowState: e });
  };
  const addAccout = () => {
    SubAccoutDispatch({ type: "visible", visible: true });
  };
  const onChangePagination = (page: number, pageSize: number | undefined) => {
    SubAccoutDispatch({ type: "pageSize", pageSize: pageSize! });
    SubAccoutDispatch({ type: "pageNumber", pageNumber: page });
  };
  const onShowSizeChange = (current: number, size: number) => {
    SubAccoutDispatch({ type: "pageSize", pageSize: size! });
    SubAccoutDispatch({ type: "pageNumber", pageNumber: current });
  };
  // const walletAuthentication = isAddress(users.email);
  // if (walletAuthentication) return (<Guard />);
  return (
    <div className="subaccout">
      <div className="subaccout-content">
        <img src={borrowEmpty} alt="borrowEmpty" />
        <div>
          <div className="subaccout-title">Sub Accounts</div>
          <Row className="subaccout-message">
            <Col span={20} className="sub_account_message">
              Create and manage sub accounts linked to your main account. You
              can create one or more sub accounts to isolate margin positions
              and restrict the maximum risk exposure for your futures
              position(s).
            </Col>
            <Col span={4}>
              <div className="subaccout-addsub" onClick={addAccout}>
                +
                <span className="anticon-user-add">
                  {props.intl.formatMessage({ id: "Add" })}
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="solid-div"></div>
      <div className="register-table">
        <Loadding show={0}>
          <Table
            columns={columns}
            dataSource={SubAccout.accoutList}
            scroll={{ x: true }}
            rowKey={(recond) => recond._key}
            expandable={{
              expandedRowRender: (record: IAccoutList, index, indent) => (
                <p style={{ margin: 0 }}>
                  {SubAccout.accoutList.length
                    ? `${"Total Account Value "} ≈ ${
                        record.estimatedAccountBalanceResp.tradingType ===
                        "USDT"
                          ? toThousands(
                              record.estimatedAccountBalanceResp.marketValue
                            )
                          : toThousands(
                              record.estimatedAccountBalanceResp.balance
                            )
                      } ${record.estimatedAccountBalanceResp.tradingType}`
                    : ""}
                </p>
              ),
              expandIconColumnIndex: 7,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <div className="expanded">
                    <span
                      className="expanded-span"
                      onClick={(e) => onExpand(record, e)}
                    >
                      {props.intl.formatMessage({ id: "Assets" })}
                    </span>
                    <img
                      alt="assets"
                      className="assets-bottom"
                      src={imgList.assetsTop}
                      onClick={(e) => onExpand(record, e)}
                    />
                    {record.isMainAccount ||
                    record.accountStatus === "ACTIVE" ||
                    !record.defaultPortfolio ? null : (
                      <div className="trashcan-box">
                        <img
                          alt="trashcan"
                          className="trashcan"
                          src={imgList.trashCan}
                          onClick={(e) => {
                            addShow(record);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="expanded">
                    <span
                      className="expanded-span"
                      onClick={(e) => onExpand(record, e)}
                    >
                      {props.intl.formatMessage({ id: "Assets" })}
                    </span>
                    <img
                      alt="assets"
                      className="assets-bottom"
                      src={imgList.assetsBottom}
                      onClick={(e) => onExpand(record, e)}
                    />
                    {record.accountType === "FLEXEARN" ||
                    record.accountStatus === "ACTIVE" ||
                    record.defaultPortfolio
                      ? null
                      : !record.defaultStandard && (
                          <div className="trashcan-box">
                            <img
                              alt="trashcan"
                              className="trashcan"
                              src={imgList.trashCan}
                              onClick={(e) => {
                                addShow(record);
                              }}
                            />
                          </div>
                        )}
                  </div>
                ),
            }}
            rowClassName={(record) =>
              record.accountStatus === "FREEZE" ? "cccc" : ""
            }
            pagination={{
              hideOnSinglePage: true,
              pageSizeOptions: ["50", "100"],
              defaultPageSize: 50,
              showQuickJumper: true,
              current: SubAccout.pageNumber,
              onShowSizeChange,
              showSizeChanger: true,
              onChange: onChangePagination,
              total: SubAccout.totalData * SubAccout.pageSize,
              itemRender,
            }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <img src={imgList.empty} alt="empty-table" />
                  <span style={{ marginTop: "12px" }}>
                    {props.intl.formatMessage({ id: "table_empty" })}
                  </span>
                </div>
              ),
            }}
          />
          {SubAccout.visible && (
            <SubAccountModalCpmonent
              visible={SubAccout.visible}
              onCloseModal={onCloseModal}
            />
          )}
          <ContainerContext.Provider value={SubAccout}>
            <Models.ChangeTradType onClose={onClose} />
            <Models.ConfirmWindow onCloseModel={onCloseWinddow} />
          </ContainerContext.Provider>
        </Loadding>
      </div>
    </div>
  );
}
const mapStateToProps = (state: ISubAccoutProps) => {
  return {
    accoutListRefresh: state.accoutListRefresh,
    users: state.users,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {
    setAccoutList(data: boolean) {
      dispatch(setAccoutList(data));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SubAccout));
