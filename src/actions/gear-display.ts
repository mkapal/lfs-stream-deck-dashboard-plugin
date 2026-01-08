import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import type { OutGaugePack, OutGaugeFlags } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

function mapGear(gear: number): string {
  if (gear === 0) return "R";
  if (gear === 1) return "N";
  if (gear >= 2) return String(gear - 1);

  return "?";
}

@action({ UUID: "com.martinkapal.lfs.dashboard.gear-display" })
export class GearDisplayAction extends SingletonAction {
  private unsubscribe?: () => void;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const text = mapGear(p.Gear);
      ev.action.setTitle(text);
    });

    streamDeck.logger.info(
      "GearDisplayAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("GearDisplayAction disappeared and unsubscribed");
  }
}
