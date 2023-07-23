import React from "react";
import Blackjack from "../components/Blackjack";

interface PageProps {
  // scoreBoard: Round[];
}

const Index = () => {
  return (
    <div>
      <Blackjack playerName="Furkan" delay={30} />
    </div>
  );
};

export const getServerSideProps = async () => {
  return { props: { test: "sent prop here" } };
};

export default Index;
