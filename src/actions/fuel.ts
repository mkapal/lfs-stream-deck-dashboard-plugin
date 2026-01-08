import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { DashLights, OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.fuel" })
export class FuelAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: 0 | 1 | 2 = 0; // 0: N/A, 1: Off, 2: On

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const isAvailable = (p.DashLights & DashLights.DL_FUELWARN) !== 0;
      const isOn = (p.ShowLights & DashLights.DL_FUELWARN) !== 0;
      const newState: 0 | 1 | 2 = isAvailable ? (isOn ? 2 : 1) : 0;
      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    streamDeck.logger.info("FuelAction appeared and subscribed to OutGaugeHub");
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("FuelAction disappeared and unsubscribed");
  }
}
