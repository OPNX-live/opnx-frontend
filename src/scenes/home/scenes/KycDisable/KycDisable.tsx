import React, { useState } from "react";
import DisableModal from "./DisableModal/DisableModal";
import "./KycDisable.scss";
import history from "router/history";

export const KycDisable = (Component: Function) => {
  return (props: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [visible, setVisible] = useState(true);
    return (
      <div id="DisableModal" className="hoc-disable">
        {props?.dashboardUserData?.isMainAccount ? (
          <Component {...props} />
        ) : (
          <DisableModal visible={visible} callBack={() => history.go(-1)} />
        )}
      </div>
    );
  };
};

export default KycDisable;
