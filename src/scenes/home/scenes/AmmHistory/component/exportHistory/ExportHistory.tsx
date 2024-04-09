import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Radio, DatePicker, Button, message } from "antd";
import { ReactComponent as DateIMG } from "assets/image/date.svg";
import moment from "moment";
import { RadioChangeEvent } from "antd/lib/radio";
import { switchValue, comparedDate } from "./data";
import messageError from "utils/errorCode";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage
} from "react-intl";
import {
  exportAmmTradeHistories,
  exportAmmOpenOrdersHistories,
  exportAmmTransferHistories,
  exportAmmInterestPaymentHistories,
  exportAmmBorrowLiquidation
} from "service/http/http";
import "./ExportHistory.scss";

const { RangePicker } = DatePicker;
const dateFormatList = ["YYYY-MM-DD", "YYYY-MM-DD"];
type IExportHistoryState = {
  dateValue: string;
  disabled: boolean;
  value: any;
  loading: boolean;
};
type IExportHistoryProps = {
  type:
    | "Trade"
    | "Open Orders"
    | "Transfer"
    | "InterestPayment"
    | "Borrow/Liquidation"
    | string;
  visible: boolean;
  handlerModale: (e: boolean) => void;
  /**  initDate : [startDate,endDate] */
  initDate: string[];
  hashToken: string;
} & WrappedComponentProps;
export class ExportHistory extends Component<
  IExportHistoryProps,
  IExportHistoryState
> {
  constructor(props: IExportHistoryProps) {
    super(props);
    this.state = {
      dateValue: "custom",
      disabled: false,
      value: this.props.initDate,
      loading: false
    };
  }
  radio = (e: RadioChangeEvent) => {
    const value = e.target.value;

    this.setState({
      dateValue: value,
      disabled: value !== "custom" ? true : false,
      value: value === "custom" ? this.props.initDate : switchValue(value)
    });
  };
  dateChange = (e: any, dateStrings: string[]) => {
    if (comparedDate(dateStrings)) {
      this.setState({ value: dateStrings });
    } else {
      message.error(messageError("31009"));
    }
  };
  exportExcel = async () => {
    const [startDate, endDate] = this.state.value;
    const { hashToken } = this.props;
    let filterHashToken = hashToken;
    let utcStartDate = moment(startDate).format("YYYY-MM-DD HH:mm:ss");
    let utcEndDate = moment(endDate)
      .add(1, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    if (this.state.dateValue === "1d") {
      utcStartDate = moment(endDate).format("YYYY-MM-DD HH:mm:ss");
      utcEndDate = moment(startDate)
        .add(1, "days")
        .format("YYYY-MM-DD HH:mm:ss");
    }
    let res;
    this.setState({ loading: true });
    try {
      switch (this.props.type) {
        case "Trade":
          res = await exportAmmTradeHistories(
            new Date(utcStartDate).getTime().toString(),
            new Date(utcEndDate).getTime().toString(),
            filterHashToken
          );
          break;
        case "Open Orders":
          res = await exportAmmOpenOrdersHistories(filterHashToken);
          break;
        case "Transfer":
          res = await exportAmmTransferHistories(
            new Date(utcStartDate).getTime().toString(),
            new Date(utcEndDate).getTime().toString(),
            filterHashToken
          );
          break;
        case "Interest Payment":
          res = await exportAmmInterestPaymentHistories(
            new Date(utcStartDate).getTime().toString(),
            new Date(utcEndDate).getTime().toString(),
            filterHashToken
          );
          break;
        case "Borrow/Liquidation":
          res = await exportAmmBorrowLiquidation(
            new Date(utcStartDate).getTime().toString(),
            new Date(utcEndDate).getTime().toString(),
            filterHashToken
          );
          break;
        default:
          break;
      }
      this.setState({ loading: false });
    } catch (err) {}
    const url = window.URL.createObjectURL(
      new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
    );
    this.download(url);
    this.setState({ loading: false });
  };
  download = (blobUrl: any) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.download = `${this.props.type}History.xls`;
    a.href = blobUrl;
    a.click();
  };
  render() {
    const { dateValue, disabled, value, loading } = this.state;
    const { visible, type } = this.props;
    const [startDate, endDate] = value;
    return (
      <Modal
        title={
          <FormattedMessage
            id="Export_History"
            values={{ type: <FormattedMessage id={type} /> }}
          />
        }
        visible={visible}
        width="392px"
        footer={null}
        className="export-history"
        maskClosable={false}
        onCancel={() => this.props.handlerModale(false)}
      >
        <div className="export-history-container">
          {type !== "Open Orders" ? (
            <Radio.Group value={dateValue} onChange={this.radio}>
              <Radio value={"1d"}>
                <FormattedMessage id="Yesterday" />
              </Radio>
              <Radio value={"1w"}>
                <FormattedMessage
                  id="Last_1_Weeks"
                  defaultMessage="Last 1 Weeks"
                />
              </Radio>
              <Radio value={"custom"}>
                <FormattedMessage
                  id="custom_weeks"
                  defaultMessage="Custom (max range 1 weeks)"
                />
              </Radio>
            </Radio.Group>
          ) : (
            <Radio.Group value={"all"} onChange={this.radio}>
              <Radio value={"all"}>
                <FormattedMessage id="all" defaultMessage="all" />
              </Radio>
            </Radio.Group>
          )}
          {type !== "Open Orders" ? (
            <p className="export-history-container-date">
              <FormattedMessage id="Date" />
            </p>
          ) : null}
        </div>
        {type !== "Open Orders" ? (
          <RangePicker
            disabled={disabled}
            format={dateFormatList}
            allowClear={false}
            suffixIcon={<DateIMG />}
            disabledDate={(current) =>
              current && current > moment().endOf("day")
            }
            onChange={this.dateChange}
            value={
              startDate && [
                moment(startDate, "YYYY-MM-DD"),
                moment(endDate, "YYYY-MM-DD")
              ]
            }
          />
        ) : null}
        <Button onClick={this.exportExcel} loading={loading}>
          <FormattedMessage id="Export" />
        </Button>
      </Modal>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ExportHistory));
