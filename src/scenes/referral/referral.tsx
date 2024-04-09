import React, { Component } from "react";
import { connect } from "react-redux";
import { Tooltip, Tabs, message } from "antd";
import QRCode from "qrcode.react";
import ReferralRecord from "./components/referralRecord";
import RebatesRecord from "./components/rebatesRecord";
import EndFooter from "components/EndFooter/EndFooter";
import take1 from "assets/image/take/take1.png";
import take2 from "assets/image/take/take2.png";
import take3 from "assets/image/take/take3.png";
import take4 from "assets/image/take/take4.png";
import favicon from "assets/image/take/favicon.png";
import banner from "assets/image/take/banner.png";
import Qcode from "assets/image/code-referral.png";
import Group from "assets/image/Group.svg";

import copy from "copy-to-clipboard";
import { shareInfo } from "service/http/http";
import "./referral.scss";
import { sendMessage } from "service/webScoket/config";
import {
  FormattedMessage,
  WrappedComponentProps,
  injectIntl,
} from "react-intl";
const { TabPane } = Tabs;

type IState = {
  shareCode: string; // 邀请码
  rewardRatio: String; // 费率
  url: String;
};

type IReferralPropsState = ReturnType<typeof mapStateToProps> &
  WrappedComponentProps;
class Referral extends Component<IReferralPropsState, IState> {
  private downloadRef = React.createRef() as any;
  constructor(props: IReferralPropsState) {
    super(props);
    this.state = {
      shareCode: "",
      rewardRatio: "0.00",
      url: `${process.env.REACT_APP_REFERRAL_URL}?id=`,
    };
  }
  componentDidMount() {
    this.props.isLogin && this.shareInfo();
    sendMessage.init();
  }
  shareInfo = () => {
    shareInfo().then((res: any) => {
      if (res.code === "0000") {
        this.setState({
          shareCode: res.data[0].shareCode,
          rewardRatio: res.data[0].rewardRatio,
          url: this.state.url + res.data[0].shareCode,
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
  onChange = () => {};
  render() {
    return (
      <div className="referral">
        <div id="HpQrcode">
          <QRCode
            value={`${this.state.url}`}
            size={150}
            level={"H"}
            imageSettings={{
              src: favicon,
              height: 50,
              width: 50,
              excavate: true, // 中间图片所在的位置是否镂空
            }}
          />
        </div>
        <img className="banner" id="banner" src={banner} alt="banner" />
        <div className="referral-top">
          <div className="referral-top-content">
            <div className="earn-code">
              Invite people to register via your referral code
            </div>
            <div className="earn-up">
              <FormattedMessage
                id="Referral_Features_Options"
                values={{
                  numberValue: (
                    <span className="percentage">
                      15%
                    </span>
                  ),
                }}
              />
            </div>
            <div className="link-content">
              <div className="link-left">
                <div className="title">
                Your Referral Link
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
                        message.success("Copied Successfully!");
                      } else {
                        if (this.props.isLogin) {
                          message.warning("loading...");
                        } else {
                          window.location.href = "/login";
                          // history.replace("/login");
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
                <div className="title">
                  {this.props.intl.formatMessage({
                    id: "Your_Referral_QR_Code",
                    defaultMessage: "Your Referral QR Code",
                  })}
                </div>
                <div className="content">
                  <Tooltip
                    placement="top"
                    color="rgba(20,22,25,1)"
                    getPopupContainer={(triggerNode) => triggerNode}
                    title={
                      <QRCode
                        imageSettings={{
                          src: Group,
                          height: 30,
                          width: 30,
                          excavate: true, // 中间图片所在的位置是否镂空
                        }}
                        value={`${this.state.url}`}
                        size={150}
                      />
                    }
                  >
                    <div className="qrcode">
                      {/* <QrcodeOutlined /> */}
                      <img src={Qcode} alt="Qcode" />
                    </div>
                  </Tooltip>
                  <div className="gun"></div>
                  <div
                    className="copy-link"
                    id="down_link"
                    onClick={() => {
                      if (this.state.shareCode !== "") {
                        this.onDropdown();
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
                    Download code
                  </div>
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
              })}
            </div>
            <div className="stake-list">
              <div className="stake-item">
                <img className="ellipse-bg" src={take1} alt="take1" />
                <div className="describe">
                  1/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_1",
                  })}
                </div>
              </div>
              <div className="stake-item">
                <img className="ellipse-bg" src={take2} alt="take1" />
                <div className="describe">
                  2/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_2",
                  })}
                </div>
              </div>
              <div className="stake-item">
                <img className="ellipse-bg" src={take3} alt="take1" />
                <div className="describe">
                  3/{" "}
                  {this.props.intl.formatMessage({
                    id: "take_3",
                  })}
                </div>
              </div>
              <div className="stake-item">
                <img className="ellipse-bg" src={take4} alt="take1" />
                <div className="describe">
                  4/{" "}
                  Receive commission when your friend trade at Open Exchange
                </div>
              </div>
            </div>
          </div>

          <div className="referral-tabs">
            <Tabs
              // activeKey={this.state.activeKey}
              onChange={this.onChange}
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
                })}
                key="3"
              >
                <div className="rebates-rules">
                  <div>
                    1.
                    {this.props.intl.formatMessage({
                      id: "optins_rules1",
                    })}
                  </div>
                  <div>
                    2.
                    {this.props.intl.formatMessage({
                      id: "optins_rules2",
                    })}
                  </div>
                  <div>
                    3.
                    {this.props.intl.formatMessage({
                      id: "optins_rules3",
                    })}
                  </div>
                  <div>
                    4.
                    {this.props.intl.formatMessage(
                      {
                        id: "optins_rules4",
                      },
                      { rate: "15" }
                    )}
                  </div>
                  <div>
                    5.
                    {this.props.intl.formatMessage({
                      id: "optins_rules5",
                    })}
                  </div>
                  <div>
                    6.
                    {this.props.intl.formatMessage({
                      id: "optins_rules6",
                    })}
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div className="referral-footer">
          <EndFooter intl={this.props.intl} />
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
)(injectIntl(Referral));
