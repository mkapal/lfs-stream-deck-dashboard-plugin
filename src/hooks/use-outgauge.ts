import { useEffect, useRef, useState } from "react";
import { type OutGaugePack } from "node-insim";

import { outGaugeHub } from "../services/outgauge";

/**
 * Subscribes to the OutGauge hub and returns a value derived from the latest
 * packet. The component only re-renders when the selected value changes.
 */
export function useOutGauge<T>(
  select: (pack: OutGaugePack) => T,
  initial: T,
): T {
  const [value, setValue] = useState<T>(initial);
  const selectRef = useRef(select);
  selectRef.current = select;

  useEffect(
    () => outGaugeHub.subscribe((pack) => setValue(selectRef.current(pack))),
    [],
  );

  return value;
}
