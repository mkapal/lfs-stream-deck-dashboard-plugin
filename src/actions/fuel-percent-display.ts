import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import type { OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.fuel-percent" })
export class FuelPercentDisplayAction extends SingletonAction {
  private unsubscribe?: () => void;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const v = p.Fuel ?? 0;
      const percent = (v * 100).toFixed(1);
      ev.action.setTitle(`${percent}%`);
    });

    streamDeck.logger.info(
      "FuelPercentDisplayAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info(
      "FuelPercentDisplayAction disappeared and unsubscribed",
    );
  }
}
