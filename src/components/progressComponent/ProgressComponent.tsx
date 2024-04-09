import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Progress } from "antd";
import { ReactComponent as Right } from "assets/image/pagination-right.svg";
import "./ProgressComponent.scss";
import MethodoModal from "scenes/feeSchedule/components/methodoModal/methodomodal";
import MakerTableModal from "scenes/feeSchedule/components/makerTableModal/makerTableModal";
import { PointComponent } from "../publicComponent/publicComponent";
import { tradLevel } from "service/http/http";
import history from "router/history";
import { toThousands } from "utils";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import { toLocaleString } from "utils/toLocaleString";
import { vipLever } from "scenes/home/scenes/dashboard/data";
interface IProgressPropsInput {
  type: string;
  lastLevel?: Number;
  feeData?: any;
  resultCallback?: (e: IProgressStateResult) => void;
}
type IProgressPropsState = ReturnType<typeof mapStateToProps>;
type IProgressDispatchState = ReturnType<typeof mapDispatchToProps>;
type IProgressProps = IProgressPropsState &
  IProgressDispatchState &
  IProgressPropsInput &
  WrappedComponentProps;

interface IProgressStateResult {
  flexBalance: string;
  levelPercent: number;
  nextLevel: string;
  vipLevel: string;
  nextFlexBalance: string;
  thirtyDayLevel: number;
  thirtyDayNextLevel: number;
  thirtyDayVolume: string;
  volume: string;
  maker: string;
  taker: string;
}
interface IProgressStateResultAccs {
  volume: number;
}
interface IProgressState {
  visable: boolean;
  visableTable: boolean;
  result: IProgressStateResult;
}
class ProgressComponent extends Component<IProgressProps, IProgressState> {
  readonly state: IProgressState = {
    visable: false,
    visableTable: false,
    result: {
      vipLevel: "0",
      nextLevel: "0",
      levelPercent: 0,
      flexBalance: "0",
      nextFlexBalance: "0",
      thirtyDayLevel: 0,
      thirtyDayNextLevel: 0,
      thirtyDayVolume: "0",
      volume: "0",
      maker: "0",
      taker: "0",
    },
  };
  constructor(props: IProgressProps) {
    super(props);
    this.FeeScheduleTempate = this.FeeScheduleTempate.bind(this);
    this.DashboardTempate = this.DashboardTempate.bind(this);
    this.TitleTemplate = this.TitleTemplate.bind(this);
    this.ExtraTemplate = this.ExtraTemplate.bind(this);
    this.SpecialVipLevel = this.SpecialVipLevel.bind(this);
  }
  async componentDidMount() {
    const result = await tradLevel();
    result.code === "0000" && this.setState({ result: result.data });
    this.props.resultCallback && this.props.resultCallback(result.data);
  }

  TitleTemplate() {
    const { useData } = this.props;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <span>
          {this.props.type === "specialVipLevel"
            ? this.props.intl.formatMessage({
                id: "FLEX_special_level",
                defaultMessage: "Your current special VIP level",
              })
            : this.props.intl.formatMessage({ id: "FLEX_level" })}
          :
          <a
            style={{ marginLeft: "6px" }}
            href="https://support.opnx.com/en/articles/7209519-trading-fees"
            target="_blank"
            rel="noreferrer"
          >
            VIP{" "}
            {vipLever(
              useData?.tradingFeeLevel?.vipType,
              useData?.tradingFeeLevel?.vipLevel,
              useData?.tradingFeeLevel?.specialVipLevel
            ) || 1}
            {/* {this.props.type === "specialVipLevel"
              ? this.props.useData.tradingFeeLevel.specialVipLevel
              : this.state.result.vipLevel} */}
          </a>
        </span>
        {/* <span style={{ fontSize: "14px", color: "rgba(229, 223, 245, 0.6)" }}>
          Maker fee: {(+this.state.result.maker * 100).toFixed(2)}%, Taker fee:
          {(+this.state.result.taker * 100).toFixed(2)}%
        </span> */}
      </div>
    );
  }
  ExtraTemplate() {
    return null;
    // <div
    //   onClick={() => {
    //     (this.props.type === "dashboard" ||
    //       this.props.type === "specialVipLevel") &&
    //       history.push("/feeSchedule");
    //   }}
    // >
    //   <span
    //     {...(this.props.type === "specialVipLevel"
    //       ? { style: { color: "#318BF5" } }
    //       : null)}
    //   >
    //     {this.props.type === "specialVipLevel"
    //       ? this.props.intl.formatMessage({ id: "More_Details" }) + ` >>`
    //       : this.props.intl.formatMessage({ id: "Update_time" })}
    //   </span>
    //   {this.props.type !== "specialVipLevel" && <Right />}
    // </div>
  }

  PointTempate() {
    return (
      <div
        style={{
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          backgroundColor: "#E5DFF5",
          display: "inline-block",
        }}
      ></div>
    );
  }

  SpecialVipLevel() {
    return (
      <div
        style={{
          color: "rgba(229,223,245,0.6)",
          fontSize: 12,
          lineHeight: "22px",
        }}
      >
        <div>{this.props.intl.formatMessage({ id: "specialVipLevel3" })}</div>
        <div>{this.props.intl.formatMessage({ id: "specialVipLevel4" })}</div>
      </div>
    );
  }

  DashboardTempate() {
    return (
      <div className="dashboard">
        <div className="dashboard-title">
          <span>{this.props.intl.formatMessage({ id: "flex_holding" })}</span>
          {/* <span>Maker fee: 0.03%, Taker fee: 0.06%</span> */}
        </div>
        <div className="dashboard-flex">
          <div>
            {toLocaleString(Number(this.state.result.flexBalance))} OX /{" "}
            {(this.state.result.levelPercent * 100).toFixed(2)}%
          </div>
          <div>
            {this.state.result.nextLevel === this.state.result.vipLevel
              ? this.props.intl.formatMessage({
                  id: "Highest-level",
                  defaultMessage: "Highest-level",
                })
              : `${toThousands(this.state.result.nextFlexBalance)} OX`}
          </div>
        </div>
        <Progress percent={this.state.result.levelPercent * 100} />
        {/* <div className="dashboard-vip">
          <div>VIP&nbsp;{this.state.result.vipLevel}</div>
          <div>
            {this.state.result.nextLevel === this.state.result.vipLevel
              ? ""
              : `VIP ${this.state.result.nextLevel}`}
          </div>
        </div> */}
        <div className="dashboard-explanation">
          <PointComponent />
          <span>
            {this.props.intl.formatMessage({ id: "flex_vip_message1" })}
          </span>
        </div>
        <div className="dashboard-explanation">
          <PointComponent />
          <span>OX holding includes holding OX tokens.</span>
        </div>
        <div className="dashboard-explanation">
          <PointComponent />
          <span>
            {this.props.intl.formatMessage({ id: "flex_vip_message2" })}
          </span>
        </div>
        <div className="dashboard-explanation" style={{ marginBottom: "16px" }}>
          <PointComponent />
          <span>
            {this.props.intl.formatMessage({ id: "flex_vip_message3" })}
          </span>
        </div>
        {/* <div
          className="dashboard-btn"
          onClick={() => {
            history.push("/feeSchedule");
          }}
        >
          {this.props.intl.formatMessage({ id: "More_Details" })} &gt;&gt;
        </div> */}
      </div>
    );
  }

  FeeScheduleTempate() {
    const { lastLevel, feeData } = this.props;
    const { result } = this.state;
    const nextLevel = feeData.filter(
      (item: any) => Number(item.vipLevel) === Number(result.vipLevel) + 1
    );
    let upgradeBalance = 0;
    let nextVipLevel = 0;
    if (feeData && nextLevel && nextLevel.length > 0) {
      upgradeBalance = Math.abs(
        Number(nextLevel[0].flexBalance) - Number(result.flexBalance)
      );
      nextVipLevel = nextLevel[0].vipLevel;
    }

    return (
      <div className="feeSchedule">
        {Number(result.vipLevel) < Number(lastLevel) ? (
          <div className="feeSchedule-title-vip">
            <FormattedMessage
              id="flex_vip_message4"
              values={{
                Balance: toThousands(upgradeBalance),
                nextLevel: nextVipLevel,
              }}
            />
          </div>
        ) : null}
        <div className="feeSchedule-box-flex">
          <div>
            <div className="feeSchedule-title">
              {this.props.intl.formatMessage({ id: "Balance" })}
            </div>
            <div className="feeSchedule-flex">
              <div>
                {toLocaleString(Number(this.state.result.flexBalance))} OX
              </div>
              <div>
                {this.state.result.nextLevel === this.state.result.vipLevel
                  ? this.props.intl.formatMessage({
                      id: "Highest-level",
                      defaultMessage: "Highest-level",
                    })
                  : `${toThousands(this.state.result.nextFlexBalance)} OX`}
              </div>
            </div>
            <Progress percent={this.state.result.levelPercent * 100} />
            <div className="feeSchedule-vip">
              <div>VIP&nbsp;{this.state.result.vipLevel}</div>
              <div>
                {this.state.result.nextLevel === this.state.result.vipLevel
                  ? ""
                  : `VIP ${this.state.result.nextLevel}`}
              </div>
            </div>
          </div>
          <div>
            <div className="feeSchedule-title">
              Trade Volume (30d in USDT)
              <u
                style={{ margin: "0 4px" }}
                onClick={() => {
                  this.setState({ visableTable: true });
                }}
              >
                {this.props.intl.formatMessage({ id: "Details" })}
              </u>
            </div>
            <div className="feeSchedule-flex-right">
              <div>{toLocaleString(Number(result.volume))} USDT</div>
            </div>
            <div className="feeSchedule-maker">
              (Maker : {toLocaleString(result.maker)} USDT + Taker : {""}
              {toLocaleString(result.taker)} USDT)
            </div>
            <Progress
              percent={
                (Number(this.state.result.volume) /
                  Number(this.state.result.thirtyDayVolume)) *
                100
              }
            />
            {/* <div className="feeSchedule-vip">
              <div>VIP&nbsp;{this.state.result.thirtyDayLevel}</div>
              <div>
                {this.state.result.thirtyDayNextLevel ===
                this.state.result.thirtyDayLevel
                  ? ""
                  : `VIP ${this.state.result.thirtyDayNextLevel}`}
              </div>
            </div> */}
          </div>
        </div>
        <div className="feeSchedule-explanation">
          <PointComponent />
          <span>
            {this.props.intl.formatMessage({ id: "flex_vip_message5" })}
          </span>
        </div>
        <div className="feeSchedule-explanation">
          <PointComponent />
          <span>OX holding includes holding OX tokens.</span>
        </div>
        <div className="feeSchedule-explanation">
          <PointComponent />
          <FormattedMessage
            id="flex_vip_message6"
            values={{
              random_snapshot: (
                <u
                  style={{ margin: "0 4px" }}
                  onClick={() => {
                    this.setState({ visable: true });
                  }}
                >
                  {this.props.intl.formatMessage({ id: "random_snapshot" })}
                </u>
              ),
            }}
          />
          {/* FLEX holdings captured by the&nbsp;
          <u
            onClick={() => {
              this.setState({ visable: true });
            }}
          >
            random snapshot
          </u>
          &nbsp;
          <span>
            taken on the previous day will be regarded as FLEX holdings of the
            day；
          </span> */}
        </div>
        <div
          className="feeSchedule-explanation"
          style={{ marginBottom: "16px" }}
        >
          <PointComponent />
          <span>
            {this.props.intl.formatMessage({ id: "flex_vip_message7" })}
          </span>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div
        className={
          this.props.type === "feeSchedule"
            ? "cf-progress  cf-progress-feeSchedule"
            : "cf-progress"
        }
      >
        <Card
          title={<this.TitleTemplate />}
          className="progress-card"
          bordered={false}
          extra={<this.ExtraTemplate />}
        >
          {this.props.type === "dashboard" && <this.DashboardTempate />}
          {this.props.type === "feeSchedule" && <this.FeeScheduleTempate />}
          {this.props.type === "specialVipLevel" && <this.SpecialVipLevel />}
          <MethodoModal
            visable={this.state.visable}
            onCloseModel={(e: boolean) => {
              this.setState({ visable: e });
            }}
          />
          <MakerTableModal
            datas={[]}
            visable={this.state.visableTable}
            onCloseModel={(e: boolean) => {
              this.setState({ visableTable: e });
            }}
          />
        </Card>
      </div>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    useData: state.dashboardUserData,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ProgressComponent));
