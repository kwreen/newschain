import "regenerator-runtime/runtime";
import React, { useRef, useState, useEffect } from "react";
import { login, logout } from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";
// import "./global.css";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  Row,
  Card,
  Form,
  Button,
} from "react-bootstrap";

import ExampleIntro from "./Components/ExampleIntro";
import ExampleNotification from "./Components/ExampleNotification";

import CreateNewsItem from "./Components/CreateNewsItem";
import About from "./Components/About";
import NewsItemList from "./Components/NewsItemList";

export default function App() {
  // use React Hooks to store greeting in component state
  const [greeting, setGreeting] = useState();

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // in this case, we only care to query the contract when signed in
    if (window.walletConnection.isSignedIn()) {
      // window.contract is set by initContract in index.js
      window.contract
        .getGreeting({ accountId: window.accountId })
        .then((greetingFromContract) => {
          setGreeting(greetingFromContract);
        });
    }
  }, []);

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <ExampleIntro />
        <p style={{ textAlign: "center", marginTop: "2.5em" }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    );
  }

  const greetingField = useRef("");

  const onSubmit = async (event) => {
    event.preventDefault();

    // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
    const newGreeting = greetingField.current.value;

    // disable the form while the value gets updated on-chain
    setButtonDisabled(true);

    try {
      // make an update call to the smart contract
      await window.contract.setGreeting({
        // pass the value that the user entered in the greeting field
        message: newGreeting,
      });

      // todo: tmp code
      // await window.contract.createNewsItem({
      //   title: newGreeting,
      //   link: "google.com/xd",
      // });
    } catch (e) {
      alert(
        "Something went wrong! " +
          "Maybe you need to sign out and back in? " +
          "Check your browser console for more info."
      );
      throw e;
    } finally {
      // re-enable the form, whether the call succeeded or failed
      setButtonDisabled(false);
    }

    // update local `greeting` variable to match persisted value
    setGreeting(newGreeting);

    setShowNotification(true);

    // remove Notification again after css animation completes
    // this allows it to be shown again next time the form is submitted
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);
  };

  return (
    <BrowserRouter>
      <Navbar expand="lg">
        <Container>
          <Navbar.Brand href="/">Newschain</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto"></Nav>
            <Nav.Link href="/create">Create</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link
              onClick={window.walletConnection.isSignedIn() ? logout : login}
            >
              {/* add code here for login */}
              {window.walletConnection.isSignedIn()
                ? window.accountId
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
              <Route exact path="/create">
                <CreateNewsItem />
              </Route>
              <Route exact path="/about">
                <About />
              </Route>
            </Switch>
          </Row>
        ) : (
          <Row className="d-flex justify-content-center">
            <Card>
              <Card.Body>
                {" "}
                <Card.Title>Please Sign In</Card.Title>
              </Card.Body>
            </Card>
          </Row>
        )}
      </Container>

      <Container>
        <button className="link" style={{ float: "right" }} onClick={logout}>
          Sign out
        </button>
        <h1>Welcome back, {window.accountId}</h1>
        <Card>
          <Card.Body>
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Greet yourself with a keyword</Form.Label>
                <Form.Control
                  placeholder={"current value: " + greeting}
                  ref={greetingField}
                  type="text"
                  onChange={(e) =>
                    setButtonDisabled(e.target.value === greeting)
                  }
                />
              </Form.Group>
            </Form>
            <Button
              disabled={buttonDisabled}
              onClick={onSubmit}
              variant="primary"
            >
              Greet
            </Button>
          </Card.Body>
        </Card>
      </Container>

      <NewsItemList />
      {showNotification && <ExampleNotification />}
    </BrowserRouter>
  );
}
