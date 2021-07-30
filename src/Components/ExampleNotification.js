import React from "react";
import PropTypes from "prop-types";

import getConfig from "../config";

const { networkId } = getConfig(process.env.NODE_ENV || "development");

const ExampleNotification = (props) => {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        " " /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: {props.changeMethod} in contract:{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  );
};

ExampleNotification.propTypes = {
  changeMethod: PropTypes.string,
};

export default ExampleNotification;
