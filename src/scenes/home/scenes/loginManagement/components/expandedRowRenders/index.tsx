import React from "react";
import { Table, message, Tooltip } from "antd";
import { imgList } from "./data";
import moment from "moment";
import { BindDefault } from "service/http/http";
import messageError from "utils/errorCode";
import { TooltipGlobal } from "components/TooltipGlobal/Tooltip";
import { status } from "scenes/home/scenes/subaccout/data";
import "./index.scss";
import { FormattedMessage } from "react-intl";
import { messageSuccess } from "utils";

const expandedRowRenders = (
  showModel: any,
  allModel: any,
  hanlderProps: any,
  page: any,
  data: any
) => {
  const hanlder = (e: any) => {
    const value = JSON.parse(e.target.dataset.value);
    value.loginKey = data.loginKey;
    if (data.accounts.length === 1) {
      message.warning(messageError("45005"));
    } else {
      showModel("Unbind", value, e);
    }
  };
  const permission = (_record: any) => {
    _record.loginKey = data.loginKey;
    allModel("permission", _record);
  };
  const permissionModel = (e: any) => {
    const value = JSON.parse(e.target.dataset.value);
    if (value.accountType === "TRADING") {
      permission(value);
    }
  };
  const bind = (e: any) => {
    const value = JSON.parse(e.target.dataset.value);
    if (!value.defaultAccount) {
      BindDefault({ accountId: value.accountId, loginId: data.loginId }).then(
        (res) => {
          if (res.code === "0000") {
            message.success(messageSuccess("00001"));
            hanlderProps(page.current, page.pageSize);
          } else {
            message.error(res.message);
          }
        }
      );
    }
  };
  const columns = [
    {
      title: <FormattedMessage id="SubAccount" />,
      dataIndex: "accountName",
      key: "accountName",
      render: (_item: any, _record: any) => (
        <div className="table-accountName">
          <Tooltip
            placement="left"
            title={<FormattedMessage id="SubAccount" />}
            overlayClassName="expandedRowRenders-tooltip"
          >
            <img
              src={
                _record.defaultAccount
                  ? imgList.accountActivate
                  : imgList.account
              }
              alt="icon"
              style={{
                width: "12px",
                height: "12px",
                verticalAlign: "-2%",
                marginRight: "6px",
              }}
              data-value={JSON.stringify(_record)}
              onClick={bind}
            />
          </Tooltip>
          <TooltipGlobal title={_record.accountName}>
            {_record.accountName}
          </TooltipGlobal>
        </div>
      ),
    },
    {
      title: <FormattedMessage id="Status" />,
      dataIndex: "Status",
      key: "Status",
      render: (item: any, record: any) => (
        <div className="table-status" style={{ cursor: "pointer" }}>
          <span
            style={{
              background:
                record.accountStatus === "ACTIVE" ? "#51FEFB" : "#F93434",
            }}
          ></span>
          <span>
            {record.accountStatus === "ACTIVE" ? (
              <FormattedMessage id="Active" />
            ) : (
              <FormattedMessage
                id={status(record.accountStatus)}
                defaultMessage={status(record.accountStatus)}
              />
            )}
          </span>
        </div>
      ),
    },
    {
      title: <FormattedMessage id="Withdraws" />,
      // width: 170,
      key: "canWithdraw",
      dataIndex: "canWithdraw",
      render: (_item: any, _record: any) => (
        <div style={{ color: "#414254" }}>
          {_record.accountType === "TRADING" ? (
            <img src={_item ? imgList.Success : imgList.Error} alt="success" />
          ) : (
            "— —"
          )}
        </div>
      ),
    },
    {
      title: <FormattedMessage id="Trade" />,
      // width: 170,
      dataIndex: "canTrade",
      key: "canTrade",
      render: (_item: any, _record: any) => (
        <div style={{ color: "#414254" }}>
          {_record.accountType === "TRADING" ? (
            <img src={_item ? imgList.Success : imgList.Error} alt="success" />
          ) : (
            "— —"
          )}
        </div>
      ),
    },
    {
      title: <FormattedMessage id="Linked_On" />,
      dataIndex: "bindDate",
      key: "bindDate",
      render: (_item: any) => (
        <div className="table-action">
          {moment(_item).format("YYYY-MM-DD HH:mm")}
        </div>
      ),
    },
    {
      title: <FormattedMessage id="Actions" />,
      dataIndex: "Actions",
      key: "Actions",
      render: (_item: any, _record: any) => (
        <div
          className="expandedRowRenders-action"
          style={{ cursor: "pointer" }}
        >
          <span
            style={{
              marginRight: "20px",
              color: _record.accountType === "TRADING" ? "#318BF5" : "#999999",
            }}
            data-value={JSON.stringify(_record)}
            onClick={permissionModel}
          >
            <FormattedMessage id="Permissions" />
          </span>
          <span
            className="expandedRowRenders-action-t1"
            data-value={JSON.stringify(_record)}
            onClick={hanlder}
          >
            <FormattedMessage id="Unlink" />
          </span>
        </div>
      ),
    },
  ];

  return (
    <Table
      className="no-hovers-children"
      columns={columns}
      rowKey={(record) => record.accountId}
      // scroll={{ x: 900 }}
      dataSource={data.accounts}
      pagination={false}
      locale={{
        emptyText: (
          <div className="empty-table">
            <img src={imgList.empty} alt="empty-table" />
            <span style={{ marginTop: "12px" }}>
              <FormattedMessage id="No_Sub_Account" />
            </span>
          </div>
        ),
      }}
    />
  );
};
export default expandedRowRenders;
