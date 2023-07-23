import React from "react";
import { Card } from "../../../types";

interface CardProps {
  card: Card;
}

const Card = (props: CardProps) => {
  const { card } = props;

  return (
    <div className="card" key={card.id}>
      {/* <img src={cardImage} alt={`${suit} ${value}`} /> */}
      {card.face}
    </div>
  );
};

export default Card;
