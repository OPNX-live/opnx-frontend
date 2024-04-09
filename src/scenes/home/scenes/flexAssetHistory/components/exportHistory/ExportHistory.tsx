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
import { exportAssetExcel, exportRepayExcel } from "service/http/http";
import "./ExportHistory.scss";
import { toUtcNumber } from "utils";

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
    | "Deposit"
    | "Withdrawal"
    | "Transfer"
    | "Delivery"
    | "Consolidated"
    | "FLEXConvert"
    | "BuyCryptoHistory"
    | "Repo"
    | "Spread"
    | "Futures"
    | "Spot"
    | string;
  visible: boolean;
  handlerModale: (e: boolean) => void;
  /**  initDate : [startDate,endDate] */
  initDate: string[];
  coin: string[];
  status: string[];
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
    this.setState({ value: dateStrings });
  };
  exportExcel = async () => {
    const [endDate, startDate] = this.state.value;
    const { coin, status } = this.props;
    let filterCoin = coin;
    let filterStatus = status as any;
    console.log(filterCoin, "filterCoin");

    let utcEndDate = moment(endDate).utc().format("YYYY-MM-DD HH:mm:ss");
    let utcStartDate = moment(startDate)
      .add(1, "days")
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");
    if (this.state.dateValue === "1d") {
      utcEndDate = moment(startDate).utc().format("YYYY-MM-DD HH:mm:ss");
      utcStartDate = moment(endDate)
        .add(1, "days")
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");
    }
    if (this.state.dateValue !== "custom") {
      filterCoin = [];
      filterStatus = [];
    }
    let res;
    this.setState({ loading: true });
    try {
      switch (this.props.type) {
        case "Mint":
        case "Redeem":
        case "Borrow":
        case "Reward":
          res = await exportAssetExcel(
            utcEndDate,
            utcStartDate,
            this.props.type.toLocaleUpperCase()
          );
          break;
        case "Repayment":
          res = await exportRepayExcel(
            utcEndDate,
            utcStartDate,
            "REPAY",
            filterCoin[0] ? filterCoin[0] : ""
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
    console.log(this.state);

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
          <Radio.Group value={dateValue} onChange={this.radio}>
            <Radio value={"1d"}>
              <FormattedMessage id="Yesterday" />
            </Radio>
            <Radio value={"2w"}>
              <FormattedMessage id="Last_2_Weeks" />
            </Radio>
            <Radio value={"1m"}>
              <FormattedMessage id="Last_1_Month" />
            </Radio>
            <Radio value={"3m"}>
              <FormattedMessage id="Last_3_Months" />
            </Radio>
            <Radio value={"custom"}>
              <FormattedMessage id="custom2" defaultMessage="Custom" />
            </Radio>
          </Radio.Group>
          <p className="export-history-container-date">
            <FormattedMessage id="Date" />
          </p>
        </div>
        <RangePicker
          disabled={disabled}
          format={dateFormatList}
          allowClear={false}
          suffixIcon={<DateIMG />}
          disabledDate={(current) => current && current > moment().endOf("day")}
          onChange={this.dateChange}
          value={
            startDate && [
              moment(startDate, "YYYY-MM-DD"),
              moment(endDate, "YYYY-MM-DD")
            ]
          }
        />
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
