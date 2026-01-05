import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { DashLights, OutGaugePack } from "node-insim";
import { insimHub } from "../services/insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.indicator-hazards" })
export class IndicatorHazardsAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: 0 | 1 = 0;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const isOn =
        (p.ShowLights & DashLights.DL_SIGNAL_L) !== 0 &&
        (p.ShowLights & DashLights.DL_SIGNAL_R) !== 0;
      const newState: 0 | 1 = isOn ? 1 : 0;

      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    streamDeck.logger.info(
      "IndicatorHazardsAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info(
      "IndicatorHazardsAction disappeared and unsubscribed",
    );
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    insimHub.toggleIndicators("all");
  }
}
