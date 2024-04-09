import React, { Component } from "react";
import { connect } from "react-redux";
import "./EarnRote.scss";
import history from "router/history";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { shareInfo } from "service/http/http";
import { DecimalNum } from "utils";
import { DOMAIN } from "@opnx-pkg/uikit";
type IEarnRotePropsState = ReturnType<typeof mapStateToProps>;
type IEarnRoteDispatchState = ReturnType<typeof mapDispatchToProps>;
interface IEarnState {
  earnRate: number;
}
class EarnRote extends Component<WrappedComponentProps, IEarnState> {
  constructor(props: WrappedComponentProps) {
    super(props);
    this.state = {
      earnRate: 0,
    };
  }
  componentDidMount() {
    shareInfo().then((res: any) => {
      if (res.code === "0000") {
        this.setState({
          earnRate: res.data?.[0]?.rewardRatio,
        });
      }
    });
  }
  render() {
    const { intl } = this.props;
    const { earnRate } = this.state;
    return (
      <div className="earn-rote">
        <div className="rote-top">
          {intl.formatMessage({ id: "invite_earn" })}
        </div>
        <div className="rote">
          <div className="rote-left">
            <div className="rote-up">
              {intl.formatMessage(
                { id: "up_to" },
                { rate: earnRate ? DecimalNum(earnRate, 100, "mul") : 0 }
              )}
            </div>
            <div className="rote-spot">
              {intl.formatMessage({ id: "spot_trading" })}
            </div>
            <div
              className="rote-invite"
              onClick={() => {
                window.location.href = DOMAIN.UI + "/referral";
              }}
            >
              {intl.formatMessage({ id: "Invite" })}
            </div>
          </div>
        </div>
      </div>
    );
  }
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
)(injectIntl(EarnRote));
