import ConfirmWindow from "./confirmWindow/index"
import ChangeTradType from "./changeTradType/index"
import SubAccountModalCpmonent from "./subAccountModalCpmonent/index"
import React from "react";
import { connect } from "react-redux";
type INamePropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps>;
function Models (){
    return <div>Name</div>;
}
const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};
Models.ConfirmWindow = ConfirmWindow
Models.ChangeTradType = ChangeTradType
Models.SubAccountModalCpmonent=SubAccountModalCpmonent
export default connect(mapStateToProps, mapDispatchToProps)(Models);

