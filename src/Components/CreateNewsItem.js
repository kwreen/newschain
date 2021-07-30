import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";

import ExampleNotification from "./ExampleNotification";

const CreateNewsItem = (props) => {
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

  const onSubmit = async (event) => {
    event.preventDefault();

    // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
    const newGreeting = greetingField.current.value;

    // disable the form while the value gets updated on-chain
    setButtonDisabled(true);

    try {
      await window.contract.setGreeting({
        message: newGreeting,
      });

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
      {showNotification && <ExampleNotification />}
    </>
  );
};

CreateNewsItem.propTypes = {};

export default CreateNewsItem;
