import React, { useState } from "react";
import { Container, Button } from "react-bootstrap";

import NewsItemList from "./NewsItemList";
import ExampleNotification from "./ExampleNotification";

const HomePage = (props) => {
  const [showNotification, setShowNotification] = useState(false);
  const THREE_HUNDRED_T_GAS = 3000000000000;

  const releaseVouchedTokens = async () => {
    try {
      await window.contract.releaseVouchedTokens(THREE_HUNDRED_T_GAS);
    } catch (e) {
      alert("Oops, that didn't work out 😔");
      throw e;
    }

    // todo: handle failure case
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);
  };

  return (
    <>
      <Container>
        <h1>
          Today's news{" "}
          <Button variant="link" onClick={releaseVouchedTokens}>
            Release tokens (temporary, tokens should be released automatically
            and not manually)
          </Button>
        </h1>

        <br />
        <NewsItemList />
      </Container>
      {showNotification && (
        <ExampleNotification changeMethod="valueVouchNewsItem" />
      )}
    </>
  );
};

HomePage.propTypes = {};

export default HomePage;
