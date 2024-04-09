import React, { Component } from "react";
import { connect } from "react-redux";
import { WrappedComponentProps, injectIntl, FormattedMessage } from "react-intl";
import history from "router/history";
import "./KYC.scss";

interface IKYCState {
  authorization: string;
}
type IKycPropsState = ReturnType<typeof mapStateToProps>;
type IKycDispatchState =  IKycPropsState & WrappedComponentProps;
export class KYCNew extends Component<IKycDispatchState, IKYCState> {
  constructor(props: IKycDispatchState) {
    super(props);
    this.state = {
      authorization: "",
    };
  }
  componentDidMount() {
    const { dashboardUserData } = this.props;
    if (dashboardUserData && dashboardUserData.accountSource !== "US") {
      history.replace("/home");
    }
  }

  render() {
    return (
      <div className="kyc-new">
        <div className="kyc-content">
          <div className="kyc-new-title">
            <FormattedMessage
                id="Submit apply for NON-US users"
                defaultMessage="Submit apply for NON-US users"
            />
          </div>
          <p className="kyc-new-top">
            <FormattedMessage
                id="The system automatically determines that you are currently a US user. According to US policy, there are the following restrictions:"
                defaultMessage="Login Management"
            />
          </p>
          <ul className="kyc-new-list">
            <li>
              <FormattedMessage
                  id="All positions cannot be greater than 25 days, otherwise the system will force liquidation "
                  defaultMessage="Login Management"
              />
            </li>
            <li>
              <FormattedMessage
                  id="Cannot use SLP network deposit "
                  defaultMessage="Login Management"
              />
            </li>
            <li>
              <FormattedMessage
                  id="Can't use Copper"
                  defaultMessage="Login Management"
              />
            </li>
          </ul>

          <p className="kyc-new-bottom">
            <FormattedMessage
                id="If you are not a U.S. user, please send an email to "
                defaultMessage="If you are not a U.S. user, please send an email to "
            />
            <a href="Mailto:onboarding@OPNX.com" target="_blank" rel="nofollow noopener noreferrer">onboarding@OPNX.com</a>
          </p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: {
  dashboardUserData: IDashboardUserData;
}) => {
  return {
    dashboardUserData: state.dashboardUserData
  };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(KYCNew));
