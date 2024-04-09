import React, { Component } from "react";
import { connect } from "react-redux";
import { Tooltip, Tabs, message } from "antd";
import QRCode from "qrcode.react";
import ReferralRecord from "./components/referralRecord";
import RebatesRecord from "./components/rebatesRecord";
import take1 from "assets/image/take/take1.png";
import take2 from "assets/image/take/take2.png";
import take3 from "assets/image/take/take3.png";
import take4 from "assets/image/take/take4.png";
import banner from "assets/image/take/banner.png";
import favicon from "assets/image/take/favicon.png";
import { DownloadDownArrow } from "assets/image";
import copy from "copy-to-clipboard";
import { shareInfo, tradFee } from "service/http/http";
import "./referralFeatures.scss";
import { sendMessage } from "service/webScoket/config";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import { DecimalNum, messageError } from "utils";
const { TabPane } = Tabs;

type IState = {
  shareCode: string; // 邀请码
  rewardRatio: String; // 费率
  url: String;
  data: any[];
  maxFeeShareRate: number;
};

type IReferralPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
type IReferralDispatchState = ReturnType<typeof mapDispatchToProps>;
class ReferralFeatures extends Component<IReferralPropsState, IState> {
  constructor(props: IReferralPropsState) {
    super(props);
    this.state = {
      shareCode: "",
      rewardRatio: "0.00",
      url: window.location.host + "/register?shareAccountId=",
      data: [],
      maxFeeShareRate: 0,
    };
  }

  componentDidMount() {
    this.props.isLogin && this.shareInfo();
    sendMessage.init();
    tradFee().then((res) => {
      if (res.success) {
        const max = res.data
          .map((i: any) => i.feeShareRate || 0)
          .reduce(function (a: number, b: number) {
            return b > a ? b : a;
          });
        this.setState({ data: res.data, maxFeeShareRate: max });
      } else {
        message.warning(res.message);
      }
    });
  }
  shareInfo = () => {
    shareInfo().then((res: any) => {
      if (res.code === "0000") {
        this.setState({
          shareCode: res.data[0]?.shareCode || 0,
          rewardRatio: res.data[0]?.rewardRatio || 0,
          url: this.state.url + res.data[0]?.shareCode,
        });
      }
    });
  };
  onDropdown = () => {
    const canvasImg: any = document.querySelector("#HpQrcode > canvas");
    const dom = document.createElement("a");
    dom.href = canvasImg.toDataURL("image/png");
    dom.download = `referralCode.png`;
    dom.click();
  };
  render() {
    return (
      <div className="referral-features">
        <div id="HpQrcode">
          <QRCode
            value={`${this.state.url}`}
            size={150}
            level={"H"}
            imageSettings={{
              src: favicon,
              height: 30,
              width: 30,
              excavate: true, // 中间图片所在的位置是否镂空
            }}
          />
        </div>
        <img className="banner" src={banner} alt="banner" />
        <div className="referral-top">
          <div className="referral-top-content">
            <div className="earn-up">
              Earn and get rewarded with OPNX
              {/* <FormattedMessage
                id="Referral_Features"
                values={{
                  numberValue: (
                    <span className="percentage">
                      {DecimalNum(+this.state.rewardRatio, 100, "mul")}%
                    </span>
                  ),
                }}
              /> */}
              {/* Earn commissions up to
              <span className="percentage">
                {Number(this.state.rewardRatio) * 100}%
              </span>
              for Futures and Spot trading */}
            </div>
            <div className="earn-content">
              <div className="earn-content-trading">
                <div className="earn-content-leftTitle">Trading</div>
                <p className="earn-content-title">
                  Unlock {DecimalNum(+this.state.rewardRatio, 100, "mul")}%
                  commission
                </p>
                <p className="earn-content-message">
                  Access basic 20% commission or complete KYC verification to
                  boost your commission to 30%.
                </p>
              </div>
              <div className="earn-content-claim">
                <div className="earn-content-leftTitle">Claim</div>
                <p className="earn-content-title">Refer a claim, get 30 USDT</p>
                <p className="earn-content-message">
                  For FTX claims, get 30 USDT and an additional 5% of the claim
                  value.
                </p>
              </div>
            </div>
            <div className="link-content">
              <div className="link-left">
                <div className="title">
                  {this.props.intl.formatMessage({
                    id: "Your_referral_link",
                    defaultMessage: "Your Referral Link",
                  })}
                </div>
                <div className="content">
                  <Tooltip
                    placement="top"
                    color="rgba(20,22,25,1)"
                    title={this.state.url}
                  >
                    <div className="link-text">{this.state.url}</div>
                  </Tooltip>
                  <div className="gun"></div>
                  <div
                    className="copy-link"
                    onClick={() => {
                      if (this.state.shareCode !== "") {
                        copy(`${this.state.url}`);
                        message.success(
                          this.props.intl.formatMessage({
                            id: "CopiedSuccessfully",
                            defaultMessage: "Copied Successfully!",
                          })
                        );
                      } else {
                        if (this.props.isLogin) {
                          message.warning("loading...");
                        } else {
                          window.location.href = "/login";
                          // history.replace('/login');
                        }
                      }
                    }}
                  >
                    {this.props.intl.formatMessage({
                      id: "Copy_referral_link",
                      defaultMessage: "Copy referral link",
                    })}
                  </div>
                </div>
              </div>
              <div className="link-right">
                <div className="title">Download Affiliate Toolkit</div>
                <div className="content">
                  <DownloadDownArrow />
                  <a
                    href="https://opnx-public-files.s3.ap-northeast-1.amazonaws.com/pdf/OPNX+Affiliate+Program.pdf"
                    rel="nofollow noopener noreferrer"
                    download="OPNXAffiliateProgram"
                    target="_blank"
                  >
                    OPNX Affiliate Program
                  </a>
                  <div className="gun"></div>
                  <DownloadDownArrow />
                  <a
                    href="https://opnx-public-files.s3.ap-northeast-1.amazonaws.com/zip/OPNX+Brand+Assets.zip"
                    rel="nofollow noopener noreferrer"
                    download="OPNXBrandAssets"
                    target="_blank"
                  >
                    OPNX Brand Assets
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="referrals-content">
          <div className="to-step">
            <div className="step-title">
              {this.props.intl.formatMessage({
                id: "Steps_to_take",
                defaultMessage: "How to earn commission on OPNX:",
              })}
            </div>
            <div className="stake-list">
              <div className="stake-item">
                <img className="ellipse-bg" src={take1} alt="take1" />
                <div className="describe">
                  1/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_1_f",
                  })}
                </div>
              </div>
              <div className="stake-item">
                <img className="ellipse-bg" src={take2} alt="take1" />
                <div className="describe">
                  2/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_2_f",
                  })}
                </div>
              </div>
              <div className="stake-item">
                <img className="ellipse-bg" src={take3} alt="take1" />
                <div className="describe">
                  3/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_3_f",
                  })}
                </div>
              </div>
              <div className="stake-item">
                <img className="ellipse-bg" src={take4} alt="take1" />
                <div className="describe">
                  4/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_4_f",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="referral-tabs">
            <Tabs
            // activeKey={this.state.activeKey}
            >
              <TabPane
                tab={this.props.intl.formatMessage({
                  id: "Referral_Record",
                })}
                key="1"
              >
                <ReferralRecord />
              </TabPane>
              <TabPane
                tab={this.props.intl.formatMessage({
                  id: "Commission_Record",
                })}
                key="2"
              >
                <RebatesRecord />
              </TabPane>
              <TabPane
                tab={this.props.intl.formatMessage({
                  id: "Commission_Rules",
                  defaultMessage: "Commission Rules",
                })}
                key="3"
              >
                {/* <div className="rules-bg">
                  <FormattedMessage
                    id="maxFeeShareRate"
                    values={{
                      maxFeeShareRate: this.state.maxFeeShareRate * 100,
                    }}
                    defaultMessage={`Open Exchange has upgraded the rebate rules. Starting from today,
                    invite friends to register and trade with Open Exchange. The
                    inviter can share up to ${
                      this.state.maxFeeShareRate * 100
                    }% of the
                    rebate.`}
                  />
                </div> */}
                {/* <div>
                  <div className="rules-title">
                    {this.props.intl.formatMessage({ id: "Rules" })} :
                  </div>
                  <div className="rules-commission">
                    {this.props.intl.formatMessage({ id: "RulesCommission" })}
                  </div>
                  <div className="vip">
                    <div className="vip-item one">
                      <div className="header-dark">
                        {this.props.intl.formatMessage({ id: "VIP" })}
                      </div>
                      <div className="header-dark header-dark-c">
                        {this.props.intl.formatMessage({ id: "FLEX_Balance" })}
                      </div>
                      <div className="header-dark">
                        {this.props.intl.formatMessage({ id: "Rebate" })}
                      </div>
                    </div>
                    {this.state.data.map((p) => (
                      <div className="vip-item">
                        <div className="body-dark">Lv {p.vipLevel}</div>
                        <div className="dark">{`>=${p.flexBalance}`}</div>
                        <div className="body-dark">
                          {(p.feeShareRate || 0) * 100}%
                        </div>
                      </div>
                    ))}

                  </div>
                </div> */}
                <div className="rebates-rules">
                  <div>
                    {this.props.intl.formatMessage({
                      id: "Terms and Conditions",
                      defaultMessage: "Terms and Conditions",
                    })}
                    :
                  </div>
                  <div>
                    1.{" "}
                    {this.props.intl.formatMessage({
                      id: "details_1",
                    })}
                  </div>
                  <div>
                    2.{" "}
                    {this.props.intl.formatMessage({
                      id: "details_2",
                    })}
                  </div>
                  <div>
                    3.{" "}
                    {this.props.intl.formatMessage({
                      id: "details_3",
                    })}
                  </div>
                  <div>
                    4.{" "}
                    {this.props.intl.formatMessage({
                      id: "details_4",
                    })}
                  </div>
                  <div>
                    5.{" "}
                    {this.props.intl.formatMessage({
                      id: "details_5",
                    })}
                  </div>
                  <div>
                    6.{" "}
                    {this.props.intl.formatMessage({
                      id: "details_6",
                    })}
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div className="referral-footer">
          {/* <OPNXFooter /> */}
          {/* <EndFooter intl={this.props.intl} /> */}
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    isLogin: state.isLogin,
  };
};
const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ReferralFeatures));
