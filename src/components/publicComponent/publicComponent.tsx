import React from "react";
import "./publicComponent.scss";
import empty from "assets/image/empty-table.png";
import { Row } from "antd";

export function PointComponent() {
  return <div className="point"></div>;
}

export function TableNoData(text:string):React.ReactNode {
  return (
    <div className="empty-table">
      <img src={empty} alt="empty" />
      <span style={{ marginTop: "12px" }}>{text}</span>
    </div>
  );
}

export const ComingSoon = () => {
  return (
      <Row className="comingsoon">Coming Soon...</Row>
    )
};
