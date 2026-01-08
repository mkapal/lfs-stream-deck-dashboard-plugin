import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import type { OutGaugePack } from "node-insim";
import { OutGaugeFlags } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

function formatTurbo(valueBar: number, flags?: OutGaugeFlags): string {
  const preferBar = (flags ?? 0) & (OutGaugeFlags.OG_BAR as number);
  if (preferBar) {
    return `${valueBar.toFixed(1)} bar`;
  }
  const psi = valueBar * 14.5037738;
  return `${psi.toFixed(1)} psi`;
}

@action({ UUID: "com.martinkapal.lfs.dashboard.turbo" })
export class TurboDisplayAction extends SingletonAction {
  private unsubscribe?: () => void;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const val = p.Turbo;
      if (val === undefined || val === null) {
        ev.action.setTitle("");
        return;
      }

      // If turbo gauge is not indicated to be shown, show empty string
      if (!((p.Flags ?? 0) & (OutGaugeFlags.OG_TURBO as number))) {
        ev.action.setTitle("");
        return;
      }

      const text = formatTurbo(val, p.Flags as OutGaugeFlags | undefined);
      ev.action.setTitle(text);
    });

    streamDeck.logger.info(
      "TurboDisplayAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("TurboDisplayAction disappeared and unsubscribed");
  }
}
