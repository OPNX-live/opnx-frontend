import React, { Component } from "react";
import { connect } from "react-redux";
import Freeze from "./isFreeze/Freeze";
import { Permission } from "./permission/permission";
import { ResetPassword } from "./resetPassword/resetPassword";
import { BindSubAaccount } from "./bindSubAaccount/bindSubAaccount";
import { CreateLogin } from "./createLogin/createLogin";

export class Model extends Component {
  static Freeze: typeof Freeze;
  static Permission: typeof Permission;
  static ResetPassword: typeof ResetPassword;
  static BindSubAaccount: typeof BindSubAaccount;
  static CreateLogin: typeof CreateLogin;
  render() {
    return <div></div>;
  }
}

const mapStateToProps = (state: any) => ({});

const mapDispatchToProps = {};
Model.Freeze = Freeze;
Model.Permission = Permission;
Model.ResetPassword = ResetPassword;
Model.BindSubAaccount = BindSubAaccount;
Model.CreateLogin = CreateLogin;

export default connect(mapStateToProps, mapDispatchToProps)(Model);
