import React from "react";
import { Container } from "react-bootstrap";

import NewsItemList from "./NewsItemList";

const HomePage = (props) => {
  return (
    <Container>
      <h1>Welcome back, {window.accountId}</h1>
      <NewsItemList />
    </Container>
  );
};

HomePage.propTypes = {};

export default HomePage;
