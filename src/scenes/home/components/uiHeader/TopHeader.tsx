import { OPNX } from "@opnx-pkg/uikit";
import React from "react";

const Header: React.FC = () => {
  return <OPNX.Header />;
};

export const BASE_URL = process.env.REACT_APP_OPNX?.endsWith("/")
  ? process.env.REACT_APP_OPNX.substr(0, process.env.REACT_APP_OPNX.length - 1)
  : process.env.REACT_APP_OPNX;

export default Header;
