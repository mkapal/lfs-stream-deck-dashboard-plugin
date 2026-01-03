import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import type { OutGaugePack } from "node-insim";
import { insimHub } from "../services/insim";
import { outGaugeHub } from "../services/outgauge";

/**
 * LFS OutGauge DashLights / ShowLights bit indices:
 * DL_SIGNAL_L = bit 5
 */
const DL_SIGNAL_L_MASK = 1 << 5;

@action({ UUID: "com.martinkapal.lfs.dashboard.indicator-left" })
export class LeftIndicatorAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: 0 | 1 = 0;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    // Ensure we start from a known state immediately
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    // Subscribe once for this action instance
    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const leftOn = (p.ShowLights & DL_SIGNAL_L_MASK) !== 0;
      const newState: 0 | 1 = leftOn ? 1 : 0;

      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    // Optional: if hubs are not configured yet, log a helpful message
    // (depends on how your hubs behave; safe to remove)
    streamDeck.logger.info(
      "LeftIndicatorAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("LeftIndicatorAction disappeared and unsubscribed");
  }

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    // No local connection logic here — global hub handles it
    insimHub.sendCommand("/light ind left");
  }
}
