import { InSim } from "node-insim";
import { InSimFlags } from "node-insim/packets";
import streamDeck from "@elgato/streamdeck";

type Cfg = { host: string; port: number; admin: string };

class InSimHub {
  private cfg?: Cfg;
  private insim: InSim = new InSim();
  private isConnecting = false;
  private isConnected = false;

  async applyConfig(next: Cfg) {
    const changed =
      !this.cfg ||
      this.cfg.host !== next.host ||
      this.cfg.port !== next.port ||
      this.cfg.admin !== next.admin;

    this.cfg = next;

    if (changed) {
      await this.reconnect();
    } else {
      this.connectOnce();
    }
  }

  private connectOnce() {
    streamDeck.logger.debug("Connect InSim once");
    if (this.isConnecting) {
      streamDeck.logger.debug("Cannot connect - already connecting");
      return;
    }
    if (this.isConnected) {
      streamDeck.logger.debug("Cannot connect - already connected");
      return;
    }
    if (!this.cfg) throw new Error("InSimHub not configured");
    streamDeck.logger.debug("Connecting InSim...");

    this.isConnecting = true;

    this.insim.on("connect", () => {
      streamDeck.logger.debug(
        `InSim connected ${this.cfg!.host}:${this.cfg!.port}`,
      );
      this.isConnected = true;
    });
    this.insim.on("disconnect", () => {
      streamDeck.logger.debug("InSim disconnected");
      this.isConnected = false;
    });

    this.insim.connect({
      IName: "StreamDeckDash",
      Host: this.cfg.host,
      Port: this.cfg.port,
      Admin: this.cfg.admin,
      Flags: InSimFlags.ISF_LOCAL,
    });

    this.isConnecting = false;
  }

  reconnect() {
    streamDeck.logger.debug("Reconnect");
    if (this.isConnecting) return;

    if (this.isConnected) {
      streamDeck.logger.debug("Is connected - disconnecting");
      this.insim.disconnect();
      this.insim.removeAllListeners();

      this.insim.on("disconnect", () => {
        streamDeck.logger.debug("Disconnected - reconnecting");
        this.isConnected = false;
        this.connectOnce();
      });
    } else {
      streamDeck.logger.debug("Connecting");
      this.connectOnce();
    }
  }

  disconnect() {
    this.insim.disconnect();
    this.insim.removeAllListeners();
  }

  sendCommand(cmd: string) {
    this.connectOnce();
    try {
      this.insim?.sendMessage(cmd);
    } catch (e) {
      streamDeck.logger.error("InSim send failed:", e);
    }
  }
}

export const insimHub = new InSimHub();
