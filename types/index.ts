export interface Card {
  id: string;
  cardType: CardTypes;
  face: string;
}

export enum PlayerType {
  Dealer = "Dealer",
  Player = "Player",
}

export enum GameStatus {
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
  Finished = "Finished",
}

export enum CardTypes {
  Diamonds = "Diamonds",
  Clubs = "Clubs",
  Hearts = "Hearts",
  Spades = "Spades",
}

export interface Round {
  // Define the properties of your round object here
  condition: RoundCondition;
  deck: Deck;
  // Add more properties as needed
}

export enum RoundCondition {
  PlayerWon = "PlayerWon",
  DealerWon = "DealerWon",
  Draw = "Draw",
}

type Deck = Card[];
