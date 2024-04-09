import React, { Component } from "react";
import { connect } from "react-redux";
import activelv2 from "assets/image/activelv2.png";
import { WrappedComponentProps, injectIntl } from "react-intl";
import "./OldLevel2.scss"
export class OldLevel2 extends Component<WrappedComponentProps> {
  render() {
    const {intl} =this.props
    return <div className="old-level">
           <div className="level-box">
          <img src={activelv2} alt="level1" />
          {intl.formatMessage({id:"level2"})}
        </div>
        <div className="level-text">{intl.formatMessage({id:"old_level2"})}</div>
    </div>;
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(OldLevel2));
