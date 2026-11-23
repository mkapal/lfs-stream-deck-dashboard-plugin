import { useKeyDown } from "@fcannizzaro/streamdeck-react";

import { getIconImage } from "../components/icon-images";
import { ImageKey } from "../components/image-key";

/** Icon state: `na` renders the empty icon, others render `<slug>-<state>`. */
export type IconState = "na" | "off" | "on" | "minor";

/**
 * Creates a key component that renders `imgs/actions/<slug>-<state>.png`.
 *
 * Note: `defineAction()` calls must stay literal in the action files, because
 * the Vite plugin extracts manifest entries from them statically.
 */
export function createIconKey(
  slug: string,
  useIconState: () => IconState,
  onPress?: () => void,
) {
  return function IconKey() {
    const state = useIconState();

    useKeyDown(() => onPress?.());

    return (
      <ImageKey
        src={getIconImage(state === "na" ? "empty" : `${slug}-${state}`)}
      />
    );
  };
}
