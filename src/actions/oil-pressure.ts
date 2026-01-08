import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { DashLights, OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.oil-pressure" })
export class OilPressureAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: 0 | 1 = 0;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const isOn = (p.ShowLights & DashLights.DL_OILWARN) !== 0;
      const newState = isOn ? 1 : 0;
      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    streamDeck.logger.info(
      "OilPressureAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("OilPressureAction disappeared and unsubscribed");
  }
}
