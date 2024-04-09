import React, { Component } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { connect } from "react-redux";
import "./ConvertSmall.scss";
import history from "router/history";
import { Button, message, Table } from "antd";
import empty from "assets/image/empty-table.png";
import { ICYModal } from "components/modal/Modal";
import { ConvertFLEX } from "assets/image";
import {
  convertFlex,
  getConvertFlex,
  getMarket,
  userBlance,
} from "service/http/http";
import { Loadding } from "components/loadding";
import { filterData, reduceValue } from "./data";
import { DecimalNum } from "utils";
import Decimal from "decimal.js";
type IConvertSmallProps = WrappedComponentProps &
  ReturnType<typeof mapStateToProps>;
type IConvertSmallState = {
  selectedRowKeys: string[];
  modal: boolean;
  data: any[];
  loadding: boolean;
  fee: number;
  FLEXvalue: number;
  btnLoading: boolean;
};
export class ConvertSmall extends Component<
  IConvertSmallProps,
  IConvertSmallState
> {
  constructor(props: IConvertSmallProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      modal: false,
      data: [],
      loadding: false,
      fee: 0,
      FLEXvalue: 0,
      btnLoading: false,
    };
  }
  componentDidMount() {
    this.init();
  }
  init = async () => {
    this.setState({ loadding: true });
    const res = await getConvertFlex();
    // const b = await userBlance(this.props.users.accountId);
    this.setState({
      data: res.data,
      loadding: false,
    });
  };
  onSelectChange = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
      fee: reduceValue(this.state.data, "fee", selectedRowKeys),
      FLEXvalue: reduceValue(this.state.data, "amount", selectedRowKeys),
    });
  };
  showModal = (e: boolean) => {
    this.setState({ modal: e });
  };
  convert = () => {
    if (this.state.selectedRowKeys.length > 0) {
      this.showModal(true);
    }
  };
  submit = async () => {
    const { selectedRowKeys } = this.state;
    this.setState({ btnLoading: true });
    const data = selectedRowKeys.map((i) => {
      return { instrument: i };
    });
    const res = await convertFlex(data);
    if (res.code === "0000") {
      message.success(
        this.props.intl.formatMessage({ id: "Conversion Successful" })
      );
      this.init();
      this.setState({ selectedRowKeys: [], FLEXvalue: 0, fee: 0 });
      this.showModal(false);
    } else {
      message.error(res.message);
    }
    this.setState({ btnLoading: false });
  };
  render() {
    const { intl } = this.props;
    const { data, fee, FLEXvalue, btnLoading } = this.state;
    const columns = [
      {
        title: intl.formatMessage({ id: "Coin" }),
        dataIndex: "instrument",
      },
      {
        title: intl.formatMessage({ id: "Available Balance" }),
        dataIndex: "quantity",
      },
      {
        title: "Value (USDT)",
        dataIndex: "usdtValue",
      },
      {
        title: "Approximate Value (OX)",
        dataIndex: "amount",
      },
    ];
    const { selectedRowKeys, modal, loadding } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      preserveSelectedRowKeys: true,
    };
    return (
      <div className="convertSmall">
        <div className="convertSmall-title">
          <span
            style={{ marginRight: "8px", cursor: "pointer" }}
            onClick={() => history.goBack()}
          >
            {intl.formatMessage({ id: "Balance" })}
          </span>
          <span style={{ marginRight: "8px" }}>{">"}</span>
          <span>Convert Small Balances to OX</span>
        </div>
        <div className="convertSmall-conten">
          <p> Convert Small Balances to OX</p>
          <p>
            You can convert small balances with total value below 100 USDT into
            OX once every 24 hours.
            <div
              onClick={() =>
                history.push({
                  pathname: "/home/walletManagement/history",
                  state: { type: "FLEX Convert" },
                })
              }
            >
              {intl.formatMessage({ id: "Conversion History >" })}
            </div>
          </p>
          <p>
            <div>
              <span>{selectedRowKeys.length}</span>
              {intl.formatMessage({
                id: "selected coins converted to",
              })}
              <span>{FLEXvalue} OX</span>
              {intl.formatMessage({
                id: "net of",
              })}
              <span>{fee} OX</span>
              transaction fee
            </div>
            <div
              className="convertSmall-conten-Convert"
              onClick={this.convert}
              style={{
                background:
                  selectedRowKeys.length === 0
                    ? "rgba(255, 255, 255, 0.3)"
                    : "",
                color: selectedRowKeys.length === 0 ? "white" : "",
              }}
            >
              {intl.formatMessage({ id: "Convert" })}
            </div>
          </p>
          <Loadding show={Number(loadding)}>
            <Table
              columns={columns}
              dataSource={data}
              rowKey={(recode: any) => recode.instrument}
              scroll={{ x: true }}
              pagination={false}
              rowSelection={rowSelection}
              locale={{
                emptyText: (
                  <div className="empty-table">
                    <img src={empty} alt="empty-table" />
                    <span style={{ marginTop: "12px" }}>
                      {intl.formatMessage({ id: "No_Data" })}
                    </span>
                  </div>
                ),
              }}
            />
          </Loadding>
        </div>
        {modal ? (
          <ICYModal
            footer={null}
            width="368px"
            centered
            className="convertSmall-modal"
            visible={modal}
          >
            <ConvertFLEX />
            <p>{intl.formatMessage({ id: "Convert to OX?" })}</p>
            <p>
              {intl.formatMessage({ id: "Appro x OX" })}{" "}
              <span> ≈ {FLEXvalue}</span>
            </p>
            <div className="convertSmall-modal-btn">
              <div onClick={() => this.showModal(false)}>
                {intl.formatMessage({ id: "Cancel" })}
              </div>
              <Button type="primary" loading={btnLoading} onClick={this.submit}>
                {intl.formatMessage({ id: "Confirm" })}
              </Button>
            </div>
          </ICYModal>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ConvertSmall));
