import React, { useEffect, useState } from "react";
import {
  Card,
  CardTypes,
  GameStatus,
  PlayerType,
  Round,
  RoundCondition,
} from "../../types";
import RoundCountdown from "./RoundCountdown";
import axios from "axios";
import Scoreboard from "./Scoreboard";

const FaceTypeToValue = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 1, // initially 1 as value
};

const deckFaces = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const NUMBER_OF_DECKS_REQUIRED = 6;
const BLACKJACK_NUMBER = 21;

interface BlackjackProps {
  playerName: string;
  delay: number; // second
}

const Blackjack = (props: BlackjackProps) => {
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);
  const [dealerDeck, setDealerDeck] = useState<Card[]>([]);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [currentGameStatus, setCurrentGameStatus] = useState<GameStatus>(
    GameStatus.Empty
  );

  const [totalValueOfPlayer, setTotalValueOfPlayer] = useState(0);
  const [totalValueOfDealer, setTotalValueOfDealer] = useState(0);
  const [scoreBoard, setScoreBoard] = useState<Round[]>([]);

  const [gameResultInfo, setGameResultInfo] = useState({});

  const { playerName, delay } = props;
  axios.defaults.headers.post["Content-Type"] = "application/json";

  useEffect(() => {
    handlePrepareDecks();
    showScoreboard();
  }, []);

  useEffect(() => {}, [playerDeck]);

  useEffect(() => {
    if (dealerDeck.length > 0) {
      if (currentGameStatus === GameStatus.DealerStayed) {
        const value = getTotalValueOfDeck(dealerDeck);
        setTotalValueOfDealer(value);

        if (value > BLACKJACK_NUMBER) {
          setCurrentGameStatus(GameStatus.DealerBusted);
          console.log("-----DEALER BUSTED!!!-----");
        } else {
          setCurrentGameStatus(GameStatus.CalculateWinner);
        }

        return;
      }

      const filteredDeck = dealerDeck.filter((_, i) => i !== 0);

      const value = getTotalValueOfDeck(filteredDeck);
      setTotalValueOfDealer(value);

      if (value > BLACKJACK_NUMBER) {
        setCurrentGameStatus(GameStatus.DealerBusted);
        console.log("-----DEALER BUSTED!!!-----");
      }
    }
  }, [dealerDeck]);

  useEffect(() => {
    handleManageGameStatus(currentGameStatus);
  }, [currentGameStatus]);

  const handleManageGameStatus = (gameStatus) => {
    let gameResultInfo = {};
    switch (gameStatus) {
      case GameStatus.DealerBusted:
      case GameStatus.PlayerWon:
        gameResultInfo = { winner: PlayerType.Player, deck: playerDeck };
        setCurrentGameStatus(GameStatus.Finished);
        sendScore(RoundCondition.PlayerWon, playerDeck, totalValueOfPlayer);
        break;

      case GameStatus.DealerWon:
      case GameStatus.PlayerBusted:
        gameResultInfo = { winner: PlayerType.Dealer, deck: dealerDeck };
        setCurrentGameStatus(GameStatus.Finished);
        sendScore(RoundCondition.DealerWon, dealerDeck, totalValueOfDealer);
        break;

      case GameStatus.CalculateWinner: {
        const dealerValue = getTotalValueOfDeck(dealerDeck);
        setTotalValueOfDealer(dealerValue);

        if (dealerValue > totalValueOfPlayer) {
          console.log("-----DEALER WON WITH HIGH VALUE!!!-----");
          setCurrentGameStatus(GameStatus.DealerWon);
        } else if (totalValueOfPlayer > dealerValue) {
          console.log("-----PLAYER WON WITH HIGH VALUE!!!-----");
          setCurrentGameStatus(GameStatus.PlayerWon);
        } else {
          console.log("-----DRAW!!!-----");
          setCurrentGameStatus(GameStatus.Draw);
        }

        showScoreboard();
        break;
      }

      case GameStatus.Draw:
        gameResultInfo = { draw: true, deck: playerDeck };
        setCurrentGameStatus(GameStatus.Finished);
        sendScore(RoundCondition.Draw, playerDeck, totalValueOfPlayer);
        break;

      case GameStatus.PlayerStayed:
        break;

      case GameStatus.Started:
        break;

      case GameStatus.Finished:
        break;

      default:
        break;
    }

    setGameResultInfo(gameResultInfo);
    console.log({ gameResultInfo });
  };

  const handlePrepareDecks = async () => {
    await getPokerCards();

    const decks = getNumberOfDecksToPlay(NUMBER_OF_DECKS_REQUIRED);
    const randomizedDecks = randomizeDeck(decks);
    setCurrentDeck(randomizedDecks);
  };

  const getPokerCards = async () => {
    // const POKER_API_URL = `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${NUMBER_OF_DECKS_REQUIRED}`;
    // const res = await fetch(POKER_API_URL);
    // const result = await res.json();
    // console.log({ result });
  };

  const getNumberOfDecksToPlay = (deckCount: number) => {
    if (deckCount < 1) {
      throw new Error("Deck Count could not be lower than 1");
    }

    const decks = [];

    for (let i = 0; i < deckCount; i++) {
      const currentDeck: Card[] = Object.keys(CardTypes)
        .map((cardType) => {
          return deckFaces.map((face) => {
            return {
              id: "deck:" + i + 1 + ",type:" + cardType + ",face:" + face,
              cardType: CardTypes[cardType],
              face,
            };
          });
        })
        .flat();
      decks.push(...currentDeck);
    }

    return decks;
  };

  /**
   * @description Fisher-Yates shuffle algorithm
   * @param deck
   * @returns
   */
  const randomizeDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const handleHitPlayer = () => {
    const card = currentDeck[0];
    const filteredDeck = currentDeck.filter((_, i) => i !== 0);
    const newPlayerDeck = [...playerDeck, { ...card }];
    console.log("Log: Player Hit");
    setPlayerDeck(newPlayerDeck);
    setCurrentDeck(filteredDeck);

    if (playerDeck.length > 0) {
      const value = getTotalValueOfDeck(newPlayerDeck);
      setTotalValueOfPlayer(value);

      if (value > BLACKJACK_NUMBER) {
        setCurrentGameStatus(GameStatus.PlayerBusted);
        console.log("-----PLAYER BUSTED!!!-----");

        return;
      }
    }

    // If player not busted hit dealer
    handleHitDealer();
  };

  const handleHitDealer = () => {
    if (totalValueOfDealer >= 17) {
      // Dealer cannot hit after 17
      return;
    }

    const card = currentDeck[0];
    const filteredDeck = currentDeck.filter((_, i) => i !== 0);
    const newDealerDeck = [...dealerDeck, { ...card }];
    console.log("Log: Dealer Hit");
    setDealerDeck(newDealerDeck);
    setCurrentDeck(filteredDeck);
  };

  const handleStayPlayer = () => {
    console.log("Log: Player Stayed");
    setCurrentGameStatus(GameStatus.PlayerStayed);

    let currentDealerValue = totalValueOfDealer;
    const hittedCardsByDealer = [];
    let i = 0;
    while (currentDealerValue < 17) {
      const card = currentDeck[i];
      currentDealerValue += getTotalValueOfDeck([{ ...card }]);
      hittedCardsByDealer.push(card);
      i++;
    }

    const filteredDeck = currentDeck.filter((_, index) => index >= i);
    const newDealerDeck = [...dealerDeck, ...hittedCardsByDealer];

    setDealerDeck(newDealerDeck);
    setCurrentDeck(filteredDeck);
    console.log("Log: Dealer Stayed");
    setCurrentGameStatus(GameStatus.DealerStayed);
  };

  const handlePrepareGame = () => {
    const firstDealerCard = currentDeck[0];
    const firstPlayerCard = currentDeck[1];
    const secondDealerCard = currentDeck[2];
    const secondPlayerCard = currentDeck[3];

    const filteredDeck = currentDeck.filter(
      (_, i) => ![0, 1, 2, 3].includes(i)
    );

    const initialDealerDeck = [firstDealerCard, secondDealerCard];
    const initialPlayerDeck = [firstPlayerCard, secondPlayerCard];

    setCurrentDeck(filteredDeck);
    setDealerDeck([firstDealerCard, secondDealerCard]);
    setPlayerDeck([firstPlayerCard, secondPlayerCard]);
    setCurrentGameStatus(GameStatus.Started);

    const playerValue = getTotalValueOfDeck(initialPlayerDeck);
    const dealerValue = getTotalValueOfDeck(initialDealerDeck);
    setTotalValueOfPlayer(playerValue);
    setTotalValueOfDealer(dealerValue);
  };

  const handleResetGame = () => {
    handlePrepareDecks();
    setDealerDeck([]);
    setPlayerDeck([]);
    setCurrentGameStatus(GameStatus.Empty);
    setTotalValueOfPlayer(0);
    setTotalValueOfDealer(0);
  };

  const shouldDealerCardDisplayed = (i) => {
    if (i === 0) {
      return [
        GameStatus.DealerBusted,
        GameStatus.PlayerBusted,
        GameStatus.PlayerStayed,
        GameStatus.DealerStayed,
        GameStatus.Finished,
      ].includes(currentGameStatus);
    }

    return true;
  };

  const getTotalValueOfDeck = (deck: Card[]): number => {
    let sum = 0;
    let acesCount = 0;

    deck.forEach((card) => {
      const amount = FaceTypeToValue[card.face];
      if (amount === 1) {
        acesCount++;
      } else {
        sum += amount;
      }
    });

    // Add Aces as 11 initially
    sum += acesCount * 11;

    // Check if adding Aces as 11 causes the total value to exceed 21
    while (acesCount > 0 && sum > 21) {
      sum -= 10; // Deduct 10 for each Ace to change its value from 11 to 1
      acesCount--;
    }

    return sum;
  };

  const handleRoundTimerEnd = () => {
    console.log("LOG: Timer finished, calculating Winners");
    setCurrentGameStatus(GameStatus.CalculateWinner);
  };

  const showScoreboard = async () => {
    const result = await axios.get("http://localhost:8080/getScores");
    const newScoreBoard = result.data.scoreBoard;
    console.log({ result });
    setScoreBoard(newScoreBoard);
  };

  const sendScore = async (
    condition: RoundCondition,
    deck: Card[],
    score: number
  ) => {
    // axios.defaults.headers.post["Content-Type"] = "application/json";
    const result = await axios.post("http://localhost:8080/submitScore", {
      condition: condition,
      deck: deck,
      score,
    } as Round);

    setScoreBoard(result.data.scoreBoard);
  };

  return (
    <div className="container">
      <div className="game">
        <div className="dealer">
          <p>Dealer Deck ({totalValueOfDealer})</p>
          <div className="dealer-deck deck">
            {dealerDeck.map((card, i) => {
              return (
                <div
                  className={`card ${
                    !shouldDealerCardDisplayed(i) ? "hidden" : ""
                  }`}
                  key={card.id}
                >
                  {shouldDealerCardDisplayed(i) ? card.face : "??"}
                </div>
              );
            })}
          </div>
        </div>

        <div className="player">
          <p>Player Deck ({totalValueOfPlayer})</p>
          <div className="player-deck deck">
            {playerDeck.map((card) => {
              return (
                <div className="card" key={card.id}>
                  {card.face}
                </div>
              );
            })}
          </div>
        </div>

        <div className="actions">
          <button
            onClick={handleHitPlayer}
            disabled={[
              GameStatus.DealerBusted,
              GameStatus.PlayerBusted,
              GameStatus.DealerStayed,
              GameStatus.PlayerStayed,
              GameStatus.Empty,
            ].includes(currentGameStatus)}
          >
            Hit
          </button>
          <button
            onClick={handleStayPlayer}
            disabled={[
              GameStatus.DealerBusted,
              GameStatus.PlayerBusted,
              GameStatus.DealerStayed,
              GameStatus.PlayerStayed,
              GameStatus.Empty,
            ].includes(currentGameStatus)}
          >
            Stay
          </button>

          <button onClick={handlePrepareGame}>Start</button>
          <button onClick={handleResetGame}>Reset</button>
        </div>
      </div>

      {![GameStatus.Finished, GameStatus.Empty].includes(currentGameStatus) ? (
        <RoundCountdown
          delay={delay}
          handleRoundTimerEnd={handleRoundTimerEnd}
        />
      ) : null}

      {/* Previous Scores */}
      {currentGameStatus === GameStatus.Finished ? (
        <Scoreboard scoreBoard={scoreBoard} />
      ) : null}
    </div>
  );
};

export default Blackjack;
