/* eslint-disable react-hooks/rules-of-hooks */
import ICYModal from "components/modal/Modal";
import React, { useEffect, useState } from "react";
import { userIsIpUs } from "service/http/http";
import "./HocIsUsModal.scss";
export const HocIsUsModal = <T extends {}>(
  Component: Function,
  type: "login" | "register"
) => {
  return (props: T) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      init();
    }, []);
    const init = async () => {
      const res = await userIsIpUs();
      setVisible(!res.data);
    };
    return (
      <>
        <Component {...props} />
        <ICYModal
          visible={visible}
          className="HocIsUsModal"
          width={400}
          closable
          centered
          title="Restricted Access"
          onCancel={() => setVisible(false)}
        >
          Open Exchange.com is not available in the United States.{" "}
          <a
            href={`https://OPNX.us/user/${type}`}
            rel="nofollow noopener noreferrer"
          >
            Click here{" "}
          </a>
          to transfer to{" "}
          <a
            href={`https://OPNX.us/user/${type}`}
            rel="nofollow noopener noreferrer"
          >
            Open Exchange.US
          </a>{" "}
          to use our platform.
        </ICYModal>
      </>
    );
  };
};
