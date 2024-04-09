import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import "./makerTableModal.scss";
import Modal from "antd/lib/modal/Modal";
import { Table, message } from "antd";
import messageError from "utils/errorCode";
import { WrappedComponentProps, injectIntl } from "react-intl";
import moment from "moment";
import { guid } from "utils";
import noData from "assets/image/no-data.png";
import { accsGpday } from "service/http/http";
import { toLocaleString } from "utils/toLocaleString";

type IDataSource = {
  date: number;
  maker: string;
  taker: string;
  total: string;
};
interface ItfaValidationProps {
  visable: boolean;
  datas: any;
  onCloseModel: (off: boolean) => void;
}

function MakerTableModal(props: ItfaValidationProps & WrappedComponentProps) {
  const columns = [
    {
      title: "Date (UTC+0)",
      dataIndex: "dt",
      key: "dt",
      render: (item: any) => (
        <div className="table-status">
          {moment.parseZone(item).local().format("YYYY-MM-DD")}
        </div>
      )
    },
    {
      title: "Maker",
      dataIndex: "makerQty",
      key: "makerQty",
      render: (item: any) => toLocaleString(item).split(".")[0]
    },
    {
      title: "Taker",
      dataIndex: "takerQty",
      key: "takerQty",
      render: (item: any) => toLocaleString(item).split(".")[0]
    },
    {
      title: "Total",
      dataIndex: "volume",
      key: "volume",
      render: (item: any) => toLocaleString(item).split(".")[0]
    }
  ];
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([] as IDataSource[]);
  const [total, setTotal] = useState(0);
  // const submit = () => {
  //   props.onCloseModel(false);
  // };
  const handleCancel = () => {
    props.onCloseModel(false);
  };
  const onChangePagination = (page: number, pageSize: number | undefined) => {
    setPageNum(page);
    setPageSize(pageSize!);
  };

  useEffect(() => {
    accsGpday(pageNum, pageSize).then((res) => {
      if (res.success) {
        setDataSource(res.data.data);
        setTotal(res.data.total);
      } else {
        message.warning(res.message);
      }
    });
  }, [pageNum, pageSize]);

  const { intl, visable } = props;
  return (
    <Modal
      width="580px"
      className="maker-model"
      visible={visable}
      footer={null}
      onCancel={handleCancel}
    >
      <div className="maker-box">
        <h2>Trade Volume (30d in USD)</h2>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowClassName={(record, index) => "table-row"}
          rowKey={(recond: any) => guid()}
          locale={{
            emptyText: (
              <div className="empty-table">
                <img src={noData} alt="empty-table" />
                <span style={{ marginTop: "12px" }}>
                  {intl.formatMessage({ id: "No_Data" })}
                </span>
              </div>
            )
          }}
          pagination={
            // props.datas.total > 10
            //   ?
            {
              defaultPageSize: pageSize,
              current: pageNum,
              total,
              onChange: onChangePagination,
              size: "small"
            }
            // : false
          }
        />
      </div>
    </Modal>
  );
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(MakerTableModal));
