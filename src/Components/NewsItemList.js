import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";

import ExampleNotification from "./ExampleNotification";

const NewsItemList = (props) => {
  const [newsItems, setNewsItems] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [vouchButtonDisabled, setVouchButtonDisabled] = useState(false);
  const [selectedNewsItemId, setSelectedNewsItemId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      let newsItems = await window.contract.getNewsItems();
      setNewsItems(newsItems);
      console.log(newsItems);

      let transactionsForNI_0 = await window.contract.getVouchTransactions({
        newsItemId: "NI_0",
      });
      console.log(transactionsForNI_0);
    };

    fetchData();
  }, []);

  const transferNearTokens = (newsItemId) => async () => {
    setVouchButtonDisabled(true);
    setSelectedNewsItemId(newsItemId);

    // todo: allow user to pick vouch amount
    const tmpVouchAmount = "0.00000011";
    console.log(
      "Value vouching " + tmpVouchAmount + " tokens for ",
      newsItemId
    );
    try {
      await window.contract.vouch({
        newsItemId: newsItemId,
        amount: window.utils.format.parseNearAmount(tmpVouchAmount),
      });
    } catch (e) {
      alert("Oops, that didn't work out 😔");
      throw e;
    }

    setVouchButtonDisabled(false);
    setSelectedNewsItemId("");
    // todo: handle failure case
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);
  };

  return (
    <>
      {newsItems.map((x, i) => {
        return (
          <Card key={i}>
            <blockquote className="blockquote mb-0 card-body">
              {x.value?.title && <Card.Text>{x.value?.title}</Card.Text>}
              <div className="text-end">
                {x.key && (
                  <Button
                    variant="link"
                    onClick={transferNearTokens(x.key)}
                    disabled={
                      selectedNewsItemId === x.key && vouchButtonDisabled
                    }
                  >
                    Vouch
                  </Button>
                )}
                {x.value?.link && (
                  // todo: fix link on click
                  <Button variant="link" href={x.value.link}>
                    Source
                  </Button>
                )}
              </div>
            </blockquote>
          </Card>
        );
      })}
      {showNotification && (
        <ExampleNotification changeMethod="valueVouchNewsItem" />
      )}
    </>
  );
};

NewsItemList.propTypes = {};

export default NewsItemList;
