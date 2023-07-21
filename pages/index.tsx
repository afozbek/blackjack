import React, { useEffect, useState } from "react";

enum CardTypes {
  Diamonds = "Diamonds",
  Clubs = "Clubs",
  Hearts = "Hearts",
  Spades = "Spades",
}
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
  A: 11,
};

enum PlayerType {
  Dealer = "Dealer",
  Player = "Player",
}

enum GameStatus {
  Started = "Start",
  DealerStayed = "DealerStayed",
  PlayerStayed = "PlayerStayed",
  DealerBusted = "DealerBusted",
  PlayerBusted = "PlayerBusted",
  PlayerWon = "PlayerWon",
  DealerWon = "DealerWon",
  CalculateWinner = "CalculateWinner",
  Empty = "Empty",
  Draw = "Draw",
}

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

interface Card {
  id: string;
  cardType: CardTypes;
  face: string;
}

const NUMBER_OF_DECKS_REQUIRED = 6;
const BLACKJACK_NUMBER = 21;

const Blackjack = () => {
  const [currentDeck, setCurrentDeck] = useState<Card[]>([]);
  const [dealerDeck, setDealerDeck] = useState<Card[]>([]);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [currentGameStatus, setCurrentGameStatus] = useState<GameStatus>(
    GameStatus.Empty
  );

  const [totalValueOfPlayer, setTotalValueOfPlayer] = useState(0);
  const [totalValueOfDealer, setTotalValueOfDealer] = useState(0);

  const [gameResultInfo, setGameResultInfo] = useState({});

  useEffect(() => {
    handlePrepareDecks();
  }, []);

  useEffect(() => {
    if (playerDeck.length > 0) {
      const value = getTotalValueOfDeck(playerDeck);
      setTotalValueOfPlayer(value);

      if (value > BLACKJACK_NUMBER) {
        setCurrentGameStatus(GameStatus.PlayerBusted);
        console.log("-----PLAYER BUSTED!!!-----");
      }
    }
  }, [playerDeck]);

  useEffect(() => {
    if (dealerDeck.length > 0) {
      if (currentGameStatus !== GameStatus.DealerStayed) {
        //

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
        break;

      case GameStatus.DealerWon:
      case GameStatus.PlayerBusted:
        gameResultInfo = { winner: PlayerType.Dealer, deck: dealerDeck };
        break;

      case GameStatus.CalculateWinner:
        if (totalValueOfDealer > totalValueOfPlayer) {
          console.log("-----DEALER WON WITH HIGH VALUE!!!-----");
          setCurrentGameStatus(GameStatus.DealerWon);
        } else if (totalValueOfPlayer > totalValueOfDealer) {
          console.log("-----PLAYER WON WITH HIGH VALUE!!!-----");
          setCurrentGameStatus(GameStatus.PlayerWon);
        } else {
          console.log("-----DRAW!!!-----");
          setCurrentGameStatus(GameStatus.Draw);
        }
        break;

      case GameStatus.Draw:
        gameResultInfo = { draw: true, deck: playerDeck };
        break;
      case GameStatus.PlayerStayed:
        break;

      case GameStatus.Started:
        break;
    }

    setGameResultInfo(gameResultInfo);
  };

  const handlePrepareDecks = () => {
    const decks = getNumberOfDecksToPlay(NUMBER_OF_DECKS_REQUIRED);
    const randomizedDecks = randomizeDeck(decks);
    setCurrentDeck(randomizedDecks);
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
      console.log({ currentDeck });
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
    setPlayerDeck(newPlayerDeck);
    setCurrentDeck(filteredDeck);

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

    setDealerDeck(newDealerDeck);
    setCurrentDeck(filteredDeck);
  };

  const getTotalValueOfDeck = (deck: Card[]) => {
    return deck.reduce((acc, card) => {
      const amount = FaceTypeToValue[card.face];
      console.log({ amount });

      return amount + acc;
    }, 0);
  };

  const handleStayPlayer = () => {
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

    console.log({ filteredDeck });

    setCurrentDeck(filteredDeck);
    setDealerDeck([firstDealerCard, secondDealerCard]);
    setPlayerDeck([firstPlayerCard, secondPlayerCard]);
    setCurrentGameStatus(GameStatus.Started);
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
      ].includes(currentGameStatus);
    }

    return true;
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
    </div>
  );
};

export default Blackjack;
