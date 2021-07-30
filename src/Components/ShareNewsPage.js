import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";

import ExampleNotification from "./ExampleNotification";

const ShareNewsPage = (props) => {
  const [greeting, setGreeting] = useState();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      window.contract
        .getGreeting({ accountId: window.accountId })
        .then((greetingFromContract) => {
          setGreeting(greetingFromContract);
        });
    }
  }, []);

  const greetingField = useRef("");
  const onGreetingSubmit = async (event) => {
    event.preventDefault();

    const newGreeting = greetingField.current.value;
    setButtonDisabled(true);

    try {
      await window.contract.setGreeting({
        message: newGreeting,
      });
    } catch (e) {
      alert("Oops, that didn't work out 😔");
      throw e;
    } finally {
      setButtonDisabled(false);
    }

    setGreeting(newGreeting);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);
  };

  const newsTitleField = useRef("");
  const newsSourceField = useRef("");
  const onNewsItemSubmit = async (event) => {
    event.preventDefault();
    // disable the form while the value gets updated on-chain
    setButtonDisabled(true);

    // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
    const newsTitleValue = newsTitleField.current.value;
    const newsSourceValue = newsSourceField.current.value;

    try {
      await window.contract.createNewsItem({
        title: newsTitleValue,
        link: newsSourceValue,
      });
    } catch (e) {
      alert("Oops, that didn't work out 😔");
      throw e;
    } finally {
      setButtonDisabled(false);
    }

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
        <h2>Share important news with peers</h2>
        {/* <Card>
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
            <Button disabled={buttonDisabled} onClick={onGreetingSubmit}>
              Greet
            </Button>
          </Card.Body>
        </Card> */}
        <Card>
          <Card.Body>
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>News title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Over 1 billion dApps now exist on the NEAR blockchain"
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Reliable source</Form.Label>
                <Form.Control type="text" placeholder="https://near.org/" />
              </Form.Group>
              <Button disabled={buttonDisabled} onClick={onNewsItemSubmit}>
                Share
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      {showNotification && <ExampleNotification />}
    </>
  );
};

ShareNewsPage.propTypes = {};

export default ShareNewsPage;
