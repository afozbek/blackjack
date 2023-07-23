import React, { useEffect } from "react";
import { useCountdown } from "usehooks-ts";

interface RoundCountdownProps {
  delay: number;
  handleRoundTimerEnd: () => void;
}

const RoundCountdown = (props: RoundCountdownProps) => {
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: props.delay,
    });

  useEffect(() => {
    startCountdown();
  }, []);

  useEffect(() => {
    if (count <= 0) {
      props.handleRoundTimerEnd();
    }
  }, [count]);

  return (
    <div className="countdown">
      Round Finishes in: <strong>{count}</strong> seconds
    </div>
  );
};

export default RoundCountdown;
