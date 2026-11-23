import { useEffect, useState } from "react";

import { type CarSwitchesState, insimHub } from "../services/insim";

const initial: CarSwitchesState = {
  indicators: "off",
  head: "off",
  fogFront: false,
  fogRear: false,
};

export function useCarSwitches(): CarSwitchesState {
  const [state, setState] = useState(initial);

  useEffect(() => insimHub.subscribeCarSwitches(setState), []);

  return state;
}
