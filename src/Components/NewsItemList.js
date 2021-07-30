import React, { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";

const NewsItemList = (props) => {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let newsItems = await window.contract.getNewsItems();
      setNewsItems(newsItems);
      console.log(newsItems);
    };

    fetchData();
  }, []);

  return (
    <Container>
      <Card>
        <blockquote className="blockquote mb-0 card-body">
          <Card.Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
            posuere erat a ante.
          </Card.Text>
          <div className="text-end">
            <small>
              <Card.Link href="#">Vouch</Card.Link>
            </small>{" "}
            <small>
              <Card.Link href="#">Source</Card.Link>
            </small>
          </div>
        </blockquote>
      </Card>
    </Container>
  );
};

NewsItemList.propTypes = {};

export default NewsItemList;
