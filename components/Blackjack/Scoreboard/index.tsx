import React from "react";
import { Round, RoundCondition } from "../../../types";

interface ScoreboardProps {
  scoreBoard: Round[];
}
const Scoreboard = (props: ScoreboardProps) => {
  console.log(props.scoreBoard);
  const playerScores = props.scoreBoard.filter(
    (round) => round.condition !== RoundCondition.DealerWon
  );

  return (
    <div>
      <h3 className="header">Previous Scores</h3>
      {playerScores.map((round) => {
        return (
          <div className="deck" key={Math.random()}>
            {round.deck.map((card) => {
              return (
                <div className="card" key={card.id}>
                  {card.face}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Scoreboard;
