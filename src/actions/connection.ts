import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { insimHub } from "../services/insim";
import { outGaugeHub } from "../services/outgauge";

@action({ UUID: "com.martinkapal.lfs.dashboard.connection" })
export class ConnectionAction extends SingletonAction {
  // No key behavior needed; action exists to show the Property Inspector UI.

  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    insimHub.reconnect();
    outGaugeHub.restart();
  }
}
