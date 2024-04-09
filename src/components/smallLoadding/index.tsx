import React, { Component } from "react";
import { connect } from "react-redux";
import "./index.scss";

type ILoadding = {
  style?: React.CSSProperties;
};
export class SmallLoadding extends Component<ILoadding> {
  render() {
    return (
      <div className="samll-loadding">
        <div
          className="samll-loadding-blur"
          style={{ display: "block" }}
        ></div>
        {this.props.children}
        <div className="spinner-box" style={{
              display: "block",
            }}>
          <div
            className="circle-border"
            style={{
              display: "block",
            }}
          >
            <div
              className="circle-core"
              style={{
                display: "block",
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

export default connect(mapStateToProps, mapDispatchToProps)(SmallLoadding);
