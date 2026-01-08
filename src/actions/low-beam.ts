import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  WillDisappearEvent,
} from "@elgato/streamdeck";
import { insimHub } from "../services/insim";

@action({ UUID: "com.martinkapal.lfs.dashboard.low-beam" })
export class LowBeamAction extends SingletonAction {
  private unsubscribe?: () => void;
  private lastState: 0 | 1 = 0;

  override async onWillAppear(ev: WillAppearEvent): Promise<void> {
    if (ev.action.isKey()) {
      ev.action.setState(this.lastState);
    }

    this.unsubscribe?.();
    this.unsubscribe = insimHub.subscribeCarSwitches((s) => {
      const newState = s.head === "low" ? 1 : 0;
      if (newState !== this.lastState) {
        this.lastState = newState;
        if (ev.action.isKey()) {
          ev.action.setState(newState);
        }
      }
    });

    streamDeck.logger.info("LowBeamAction appeared and subscribed to InSimHub");
  }

  override async onWillDisappear(_ev: WillDisappearEvent): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    streamDeck.logger.info("LowBeamAction disappeared and unsubscribed");
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    insimHub.toggleLights("low");
  }
}
