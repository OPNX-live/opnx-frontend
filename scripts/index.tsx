import React, { Component } from "react";
import { connect } from "react-redux";
import "./index.scss";
type INamePropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps>;
class Name extends Component {
  render() {
    return <div>Name</div>;
  }
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Name);
