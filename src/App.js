import "regenerator-runtime/runtime";
import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
// import "./global.css";

import { Container, Navbar, Nav, Row, Button } from "react-bootstrap";

import { login, logout } from "./utils";

import ExampleIntro from "./Components/ExampleIntro";
import ShareNewsPage from "./Components/ShareNewsPage";
import AboutPage from "./Components/AboutPage";
import HomePage from "./Components/HomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand href="/">Newschain</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto"></Nav>
            <Nav.Link href="/share">Share news</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link
              onClick={window.walletConnection.isSignedIn() ? logout : login}
            >
              {/* add code here for login */}
              {window.walletConnection.isSignedIn()
                ? window.accountId + " (log out)"
                : "Login"}
            </Nav.Link>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        {window.walletConnection.isSignedIn() ? (
          <Row
            className="d-flex justify-content-center"
            style={{ marginTop: "10px" }}
          >
            <Switch>
              <Route exact path="/">
                <HomePage />
              </Route>
              <Route exact path="/share">
                <ShareNewsPage />
              </Route>
              <Route exact path="/about">
                <AboutPage />
              </Route>
            </Switch>
          </Row>
        ) : (
          <>
            <ExampleIntro />
            <p style={{ textAlign: "center", marginTop: "2.5em" }}>
              <Button onClick={login}>Sign in</Button>
            </p>
          </>
        )}
      </Container>
    </BrowserRouter>
  );
}
