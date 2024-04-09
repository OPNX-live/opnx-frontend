import { Button, Checkbox, message, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import ICYModal from "components/modal/Modal";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import history from "router/history";
import { submitTos } from "service/http/http";
import { LoadingOutlined } from "@ant-design/icons";
import "./TermService.scss";
const antIcon = (
  <LoadingOutlined
    style={{ fontSize: 24, marginRight: 12, color: "#0B71EA" }}
    spin
  />
);
type TermServiceProps = ReturnType<typeof mapStateToProps>;
export const TermService = ({ isLogin }: TermServiceProps) => {
  const [modal, setModal] = useState(true);
  const [checkbox, setCheckbox] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!isLogin) {
      window.location.href = "/login";
      // history.replace("/login");
    }
  }, [isLogin]);
  const checkBoxChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setCheckbox(true);
    }
  };
  const submit = async () => {
    if (checkbox) {
      setLoading(true);
      const res = await submitTos();
      if (res.code === "0000") {
        history.goBack();
      } else {
        message.error(res.message);
      }
      setLoading(false);
    } else {
      message.error('Please tick "I agree to the updated Terms of Service"');
    }
  };
  return (
    <div className="TermService">
      <ICYModal
        visible={modal}
        maskClosable={true}
        closable
        className="TermService-modal"
        title="Why am I seeing this?"
        onCancel={() => setModal(false)}
      >
        We've updated our Terms of Service. Please review the changes and agree
        to the updated terms to continuing using your account.
      </ICYModal>
      <div className="TermService-conetnt">
        <p>Please note that the following terms have been updated:</p>
        <p>
          1.4.1: "Account" means any and all accounts, including sub-accounts,
          following the online registration you have with us, which are created
          when you (i) register on the Platform; and (ii) complete KYC to enable
          Stablecoin deposits/withdrawals;
        </p>
        <p>
          9.12: If balances in your sub-Account reach a negative balance then
          the Platform will have the right to merge such sub-Account with your
          main Account.
        </p>
        <p>
          10.2: If, after a Close Out, any part of the relevant Leverage Funding
          is not fully repaid, you remain liable to us for that amount. We
          reserve the right during this time to impose a Clawback in respect of
          some or all Users including against balances on all your Accounts on
          the Platform.
        </p>
        <p>
          14.3: In rare situations the Platform will have the right to convert
          any open spot positions of Users to a "dollarised" USDC position. Such
          actions will only be taken after providing Users with at least 24hrs
          of notice. "
        </p>

        <Checkbox checked={checkbox} onChange={checkBoxChange}>
          I agree to the updated{" "}
          <a
            href="https://OPNX.com/terms-of-service/"
            rel="nofollow noopener noreferrer"
          >
            Terms of Service
          </a>
        </Checkbox>
        <Button type="primary" onClick={submit}>
          {loading && <Spin indicator={antIcon} />}
          Confirm
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IGlobalT) => ({
  isLogin: state.isLogin,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TermService);
