import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.display1" })
export class Display1Action extends SingletonAction {
  private unsubscribe?: () => void;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const text = p.Display1.trim() ?? "";

      if (ev.action.isKey()) {
        ev.action.setTitle(text);
      }
    });

    streamDeck.logger.info(
      "Display1Action appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("Display1Action disappeared and unsubscribed");
  }
}
