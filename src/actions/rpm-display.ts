import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import type { OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.rpm-display" })
export class RPMDisplayAction extends SingletonAction {
  private unsubscribe?: () => void;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const rpm = Math.round(p.RPM ?? 0);
      ev.action.setTitle(String(rpm));
    });

    streamDeck.logger.info(
      "RPMDisplayAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("RPMDisplayAction disappeared and unsubscribed");
  }
}
