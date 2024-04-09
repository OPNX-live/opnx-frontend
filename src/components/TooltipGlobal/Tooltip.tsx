import React, { Component } from "react";
import { connect } from "react-redux";
import { Tooltip } from "antd";
import "./Tooltip.scss";
type ITooltipProps = {
  title: string;
 
  className?: string;
};

export class TooltipGlobal extends Component<ITooltipProps> {
  render() {
    const children = this.props.children as any;
    return (
      <Tooltip
        {...this.props}
        getPopupContainer={(triggerNode) => triggerNode}
      >
        {children}
      </Tooltip>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
