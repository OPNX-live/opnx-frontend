import React, { Component } from "react";
import { connect } from "react-redux";
import { Checkbox, Button, Modal, message } from "antd";
import advantageIcon from "assets/image/moonpay_icon_advantage.png";
import securityIcon from "assets/image/moonpay_icon_security.png";
import fundingIcon from "assets/image/moonpay_icon_funding.png";
import emailIcon from "assets/image/moonpay_icon_email.png";
import rightIcon from "assets/image/moonpay_icon_right.png";
import noticeIcon from "assets/image/notice.png";
import { setAgreeMoonpay } from "store/actions/publicAction";
import {
  getMoonpayCurrencies,
  agreeMoonpay,
  getMoonpayDepositAddress,
  allowMoonpay,
} from "service/http/http";
import messageError from "utils/errorCode";
import "./moonpay.scss";
import history from "router/history";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from "react-intl";
import crypto from "crypto";
type IMoonpayAddress = {
  instrumentId: string;
  address: string;
  lastUpdated: number;
  legacyAddress: string;
  network: string;
  providerName: string;
  tag: string | null;
};
type IMoonpayAllow = {
  country: string;
  isAllow: boolean;
};

type IMoonpayState = {
  checked: boolean;
  depositAddress: IMoonpayAddress[];
  moonpayCurrencies: any;
  moonpayAllow: IMoonpayAllow;
  visibleDisclaimer: boolean;
  addressStr: string;
  tagStr: string;
};
type IMoonpayDisplayProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  WrappedComponentProps;
export class Moonpay extends Component<IMoonpayDisplayProps, IMoonpayState> {
  constructor(props: IMoonpayDisplayProps) {
    super(props);
    this.state = {
      checked: false,
      visibleDisclaimer: !this.props.dashboardUserData.agreeMoonPay,
      depositAddress: [],
      moonpayCurrencies: [],
      moonpayAllow: { country: "", isAllow: true },
      addressStr: "",
      tagStr: "",
    };
  }
  setCheckbox = (e: any) => {
    this.setState({ checked: e.target ? e.target.checked : e });
  };
  submit = () => {
    if (this.state.checked) {
      try {
        agreeMoonpay().then((res) => {
          if (res.code === "0000") {
            this.setState({
              visibleDisclaimer: false,
            });
            this.props.setDashboardUserData(true);
          } else {
            message.warning(res.message);
          }
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      message.warning("请勾选同意");
    }
  };
  getMoonpayDepositAddress = async () => {
    try {
      await getMoonpayDepositAddress().then((res) => {
        if (res.code === "0000") {
          this.setState({
            depositAddress: res.data,
          });
        } else {
          message.warning(res.message);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  getAllowMoonpay = async () => {
    try {
      await allowMoonpay().then((res) => {
        if (res.code === "0000") {
          this.setState({
            moonpayAllow: res.data,
          });
        } else {
          message.warning(res.message);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  getMoonpayCurrencies = async () => {
    try {
      const apiKey = "";
      await getMoonpayCurrencies(apiKey).then((res) => {
        this.setState({
          moonpayCurrencies: res,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };
  toHistory = () => {
    history.push({
      pathname: "/home/walletManagement/history",
      state: { type: "BuyCryptoHistory" },
    });
  };
  toSupport = () => {
    history.push("/home/support");
  };
  toEmail = () => {
    history.push("/home/security");
  };
  initData = () => {
    const addressJson = {} as any;
    const tagJson = {} as any;
    this.state.depositAddress.forEach((item: any) => {
      this.state.moonpayCurrencies.forEach((currencies: any) => {
        const regex =
          process.env.REACT_APP_ENV === "LIVE"
            ? currencies.addressRegex
            : currencies.testnetAddressRegex;
        const addressRegex = new RegExp(regex);
        if (
          currencies.code === item.instrumentId.toLocaleLowerCase() &&
          addressRegex.test(item.address)
        ) {
          addressJson[item.instrumentId.toLocaleLowerCase()] = item.address;
          if (item.tag) {
            tagJson[item.instrumentId.toLocaleLowerCase()] = item.tag;
          }
        }
      });
    });
    this.setState({
      addressStr: encodeURIComponent(JSON.stringify(addressJson)),
      tagStr: JSON.stringify(tagJson)
        .replace(/{/g, "%7B")
        .replace(/:/g, "%3A")
        .replace(/;/g, "%2C")
        .replace(/}/g, "%7D"),
    });
  };
  async componentDidMount() {
    if (!this.props.users) {
      window.location.href = "/login";
      return;
    }
    try {
      this.getAllowMoonpay();
      await this.getMoonpayCurrencies();
      await this.getMoonpayDepositAddress();
      await this.initData();
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    const { checked, visibleDisclaimer, addressStr, tagStr } = this.state;
    const { users, dashboardUserData } = this.props;
    const email = encodeURIComponent(dashboardUserData.bindEmail);
    const { intl } = this.props;
    const originalUrl = `https://${process.env.REACT_APP_MOONPAY_URL}?apiKey=&colorCode=%23252547&language=${intl.locale}&externalCustomerId=${users.accountId}&kycAvailable=true&baseCurrencyCode=usd&defaultCurrencyCode=btc&email=${email}&walletAddresses=${addressStr}&walletAddressTags=${tagStr}`;

    const signature = crypto
      .createHmac("sha256", "")
      .update(new URL(originalUrl).search)
      .digest("base64");

    const urlWithSignature = `${originalUrl}&signature=${encodeURIComponent(
      signature
    )}`;
    return (
      <div className="moonpay">
        <div className="moonpay-support">
          {/* <div>Support Center</div> */}
          <div onClick={this.toHistory}>Buy Crypto History</div>
        </div>
        {email && addressStr ? (
          <div className="moonpay-iframe">
            <iframe
              title="Moonpay"
              allow="accelerometer; autoplay; camera; gyroscope; payment"
              frameBorder="0"
              height="100%"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              src={urlWithSignature}
              width="100%"
            >
              <p>Your browser does not support iframes.</p>
            </iframe>
          </div>
        ) : (
          <div className="moonpay-iframe"></div>
        )}
        <div className="moonpay-advantages">
          <h2>Our Advantages</h2>
          <ul>
            <li className="moonpay-advantages-item">
              <img src={securityIcon} alt="security" />
              <h3>Secure</h3>
              <p>
                Safety of our funds is our top priority. This means our security
                is up-to-date and inline with industry standards
              </p>
            </li>
            <li className="moonpay-advantages-item">
              <img src={fundingIcon} alt="funding" />
              <h3>Accessible</h3>
              <p>
                You can purchase crypto from different currencies and locations
                around the world.
              </p>
            </li>
            <li className="moonpay-advantages-item">
              <img src={advantageIcon} alt="advantage" />
              <h3>Simple</h3>
              <p>Intuitive and easy-to-use.</p>
            </li>
          </ul>
        </div>
        {/* disclaimerModal */}
        <Modal
          className="moonpay-modal-disclaimer"
          visible={visibleDisclaimer}
          footer={null}
          closable={false}
          width="800px"
          centered
        >
          <h2 className="moonpay-modal-disclaimer-title">Disclaimer</h2>
          <p className="moonpay-modal-disclaimer-text">
            Services related to credit card payments are provided by MoonPay,
            which is a separate platform owned by a third party. Please read and
            agree to the Terms of Use of MoonPay before using the service. For
            any questions relating to credit card payments, please contact
            MoonPay. Open Exchange does not assume any responsibility for any
            loss or damage caused by the use of the credit card payment service.
          </p>
          <div className="moonpay-modal-disclaimer-checkbox">
            <Checkbox checked={checked} onChange={this.setCheckbox}>
              <FormattedMessage
                id="moonpay_announcement"
                defaultMessage="I have read and agree to the Terms of Use"
              />
            </Checkbox>
          </div>
          <Button
            size="large"
            onClick={this.submit}
            className="moonpay-modal-disclaimer-button"
            disabled={!checked}
          >
            <FormattedMessage id="Continue" />
          </Button>
        </Modal>
        {/* emailModal */}
        <Modal
          className="moonpay-modal-email"
          visible={
            this.state.moonpayAllow.isAllow && !dashboardUserData?.bindEmail
              ? true
              : false
          }
          footer={null}
          width="520px"
          closable={false}
          centered
          bodyStyle={{ textAlign: "center" }}
        >
          <img
            src={emailIcon}
            alt="bind_email"
            className="moonpay-modal-email-icon"
          />
          <p className="moonpay-modal-email-text">
            Email is not currently bound, you must bind email
          </p>
          <div className="moonpay-modal-email-to" onClick={this.toEmail}>
            <span>Go to binding</span>
            <img src={rightIcon} alt="to" />
          </div>
        </Modal>
        {/* allowModal */}
        <Modal
          className="moonpay-modal-allow"
          visible={!this.state.moonpayAllow.isAllow ? true : false}
          footer={null}
          width="520px"
          closable={false}
          centered
          bodyStyle={{ textAlign: "center" }}
        >
          <img
            src={noticeIcon}
            alt="notice"
            className="moonpay-modal-allow-icon"
          />
          <p className="moonpay-modal-allow-text">
            You are unable to access Open Exchange products(Buy Crypto) in your
            country({this.state.moonpayAllow.country}) due to local laws.
          </p>
          <Button
            size="large"
            onClick={() => {
              history.go(-1);
            }}
            className="moonpay-modal-allow-button"
          >
            <FormattedMessage id="Close" />
          </Button>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: IGlobalT) => ({
  users: state.users,
  dashboardUserData: state.dashboardUserData,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    setDashboardUserData(data: boolean) {
      dispatch(setAgreeMoonpay(data));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Moonpay));
