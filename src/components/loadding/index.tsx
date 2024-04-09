import React, { Component } from "react";
import { connect } from "react-redux";
import "./index.scss";

type ILoadding = {
  show: Number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};
export class Loadding extends Component<ILoadding> {
  render() {
    return (
      <div className="loadding-version-1">
        <div className="loadding-version-1-blur" style={{ display: this.props.show ? "block" : "none" }}></div>
        {this.props.children}
        <div
          className="spinner-box"
          style={{
            display: this.props.show ? "block" : "none",
          }}
        >
          <div
            className="circle-border"
            style={{
              display: this.props.show ? "block" : "none",
            }}
          >
            <div
              className="circle-core"
              style={{
                display: this.props.show ? "block" : "none",
                ...this.props.style,
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Loadding);
