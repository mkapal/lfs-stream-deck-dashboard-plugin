import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { DashLights, OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";
import { insimHub } from "../services/insim";

@action({ UUID: "com.martinkapal.lfs.dashboard.indicator-right" })
export class IndicatorRightAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: 0 | 1 = 0;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const isRightOn = (p.ShowLights & DashLights.DL_SIGNAL_R) !== 0;
      const newState = isRightOn ? 1 : 0;

      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    streamDeck.logger.info(
      "IndicatorRightAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("IndicatorRightAction disappeared and unsubscribed");
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    insimHub.toggleIndicators("right");
  }
}
