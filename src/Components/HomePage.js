import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";

import { login, logout } from "../utils";

import NewsItemList from "./NewsItemList";
import ExampleIntro from "./ExampleIntro";
import ExampleNotification from "./ExampleNotification";

const HomePage = (props) => {
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
    <>
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
        <NewsItemList />
      </Container>
      {showNotification && <ExampleNotification />}
    </>
  );
};

HomePage.propTypes = {};

export default HomePage;
