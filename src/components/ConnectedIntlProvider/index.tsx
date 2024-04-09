import React, { Component, ReactNode } from "react";
import { connect } from "react-redux";
import CHINA_MESSAGES from "../../locale/zh.json";
import ENGLISH_MESSAGES from "../../locale/en.json";
import { IntlProvider } from "react-intl";
const chinaMessage = CHINA_MESSAGES;
const englistMessage = ENGLISH_MESSAGES;
interface ILanguagerops {
  SwitchLanguage: string;
  children:ReactNode
}

class ConnectedIntlProvider extends Component<ILanguagerops> {
  jumpLanguage = (data: string) => {
    if (data === "en") {
      return englistMessage;
    } else if (data === "zh") {
      return chinaMessage;
    }
  };
  render() {
    const { children, SwitchLanguage } = this.props;
    return (
      <IntlProvider
        key={SwitchLanguage || "en"}
        locale={SwitchLanguage || "en"}
        messages={this.jumpLanguage(SwitchLanguage || "en")}
      >
        {children}
      </IntlProvider>
    );
  }
}

const mapStateToProps = (state: ILanguagerops) => {
  return {
    SwitchLanguage: state.SwitchLanguage
  };
};

export default connect(mapStateToProps)(ConnectedIntlProvider);
