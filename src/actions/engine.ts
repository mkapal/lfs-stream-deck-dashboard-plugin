import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { DashLights, OutGaugePack } from "node-insim";
import { outGaugeHub } from "../services/outgauge";

type State = 0 | 1 | 2 | 3;

@action({ UUID: "com.martinkapal.lfs.dashboard.engine" })
export class EngineAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: State = 0;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    this.unsubscribe?.();
    this.unsubscribe = outGaugeHub.subscribe((p: OutGaugePack) => {
      const isAvailable = p.DashLights & DashLights.DL_ENGINE;
      const isOn = (p.ShowLights & DashLights.DL_ENGINE) !== 0;
      const isSevere = (p.ShowLights & 0x10000000) !== 0;

      let newState: State;

      if (isAvailable) {
        if (isOn) {
          newState = isSevere ? 3 : 2;
        } else {
          newState = 1;
        }
      } else {
        newState = 0;
      }

      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    streamDeck.logger.info(
      "EngineAction appeared and subscribed to OutGaugeHub",
    );
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("EngineAction disappeared and unsubscribed");
  }
}
