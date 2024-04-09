import React from "react";
import history from "router/history";
import Server from "assets/image/500.png";
import "./style/500.scss";
function Index() {
  return (
    <div className="Server" onClick={() => history.replace("/home")}>
      <div className="noPage-container">
        <img src={Server} alt="500" className="noPage-bg" />
      </div>
    </div>
  );
}
export default Index;
