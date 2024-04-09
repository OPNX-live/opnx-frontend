import React, { Component } from "react";
import { connect } from "react-redux";
import { IEndFooterStates } from "./type";

import "./EndFooter.scss";
import { WrappedComponentProps } from "react-intl";
import { OPNX } from "@opnx-pkg/uikit";
type IEndFooterPropsState = ReturnType<typeof mapStateToProps>;
type IEndFooterDispatchState = ReturnType<typeof mapDispatchToProps>;
type IEndFooterProps = IEndFooterPropsState &
  IEndFooterDispatchState &
  WrappedComponentProps;
class EndFooter extends Component<IEndFooterProps, IEndFooterStates> {
  readonly state: IEndFooterStates = {};

  render() {
    return (
      <div className="flex-footer">
        <OPNX.Footer />
      </div>
    );
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(EndFooter);
