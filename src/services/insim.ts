import streamDeck from "@elgato/streamdeck";
import { InSim } from "node-insim";
import {
  InSimFlags,
  IS_ISI_ReqI,
  IS_TINY,
  PacketType,
  SmallType,
  TinyType,
} from "node-insim/packets";

type Cfg = { host: string; port: number; admin: string };

const indicatorStates = ["off", "left", "right", "all"] as const;
const headlightStates = ["off", "side", "low", "high"] as const;

type IndicatorState = (typeof indicatorStates)[number];
type HeadlightState = (typeof headlightStates)[number];

export type CarSwitchesState = {
  indicators: IndicatorState;
  head: HeadlightState;
  fogFront: boolean;
  fogRear: boolean;
};

const initialCarSwitches: CarSwitchesState = {
  indicators: "off",
  head: "off",
  fogFront: false,
  fogRear: false,
};

const CAR_LIGHTS_POLL_MS = 100;

class InSimHub {
  private cfg?: Cfg;
  private inSim?: InSim;
  private isConnected = false;
  private carLightsInterval: NodeJS.Timeout | null = null;

  private carSwitchesState: CarSwitchesState = initialCarSwitches;
  private switchesListeners = new Set<(s: CarSwitchesState) => void>();

  async applyConfig(next: Cfg) {
    const changed =
      !this.cfg ||
      this.cfg.host !== next.host ||
      this.cfg.port !== next.port ||
      this.cfg.admin !== next.admin;

    this.cfg = next;

    if (changed) {
      this.reconnect();
    } else {
      this.connectOnce();
    }
  }

  private connectOnce() {
    if (this.inSim) return;
    if (!this.cfg) throw new Error("InSimHub not configured");

    streamDeck.logger.debug(
      `Connecting InSim ${this.cfg.host}:${this.cfg.port}...`,
    );

    const inSim = new InSim();
    this.inSim = inSim;

    inSim.on("connect", () => {
      streamDeck.logger.debug("InSim connected");
      this.isConnected = true;
    });

    inSim.on("disconnect", () => {
      streamDeck.logger.debug("InSim disconnected");
      this.isConnected = false;
      this.stopPolling();
    });

    inSim.on(PacketType.ISP_VER, (packet) => {
      if (packet.ReqI === IS_ISI_ReqI.SEND_VERSION) {
        this.stopPolling();
        this.carLightsInterval = setInterval(() => {
          inSim.send(new IS_TINY({ ReqI: 1, SubT: TinyType.TINY_LCL }));
        }, CAR_LIGHTS_POLL_MS);
      }
    });

    inSim.on(PacketType.ISP_SMALL, (packet) => {
      if (packet.ReqI !== 1 || packet.SubT !== SmallType.SMALL_LCL) return;

      const u = packet.UVal;

      this.setCarSwitches({
        indicators: indicatorStates[(u & (3 << 16)) >> 16] ?? "off",
        head: headlightStates[(u & (3 << 18)) >> 18] ?? "off",
        fogFront: (u & (1 << 21)) !== 0,
        fogRear: (u & (1 << 20)) !== 0,
      });
    });

    inSim.connect({
      IName: "StreamDeckDash",
      Host: this.cfg.host,
      Port: this.cfg.port,
      Admin: this.cfg.admin,
      Flags: InSimFlags.ISF_LOCAL,
      ReqI: IS_ISI_ReqI.SEND_VERSION,
    });
  }

  private stopPolling() {
    if (this.carLightsInterval) {
      clearInterval(this.carLightsInterval);
      this.carLightsInterval = null;
    }
  }

  private setCarSwitches(next: CarSwitchesState) {
    const prev = this.carSwitchesState;

    if (
      next.indicators === prev.indicators &&
      next.head === prev.head &&
      next.fogFront === prev.fogFront &&
      next.fogRear === prev.fogRear
    ) {
      return;
    }

    this.carSwitchesState = next;
    for (const cb of this.switchesListeners) cb(next);
  }

  subscribeCarSwitches(cb: (s: CarSwitchesState) => void): () => void {
    this.connectOnce();
    this.switchesListeners.add(cb);
    cb(this.carSwitchesState);

    return () => {
      this.switchesListeners.delete(cb);
    };
  }

  reconnect() {
    streamDeck.logger.debug("Reconnect InSim");
    this.disconnect();
    this.connectOnce();
  }

  disconnect() {
    this.stopPolling();
    this.inSim?.disconnect();
    this.inSim?.removeAllListeners();
    this.inSim = undefined;

    this.isConnected = false;
    this.setCarSwitches(initialCarSwitches);
  }

  sendCommand(cmd: string) {
    this.connectOnce();

    try {
      this.inSim?.sendMessage(cmd);
    } catch (e) {
      streamDeck.logger.error("InSim send failed:", e);
    }
  }

  toggleIndicators(indicators: Exclude<IndicatorState, "off">) {
    if (!this.isConnected) return;

    this.sendCommand(
      this.carSwitchesState.indicators === indicators
        ? "/light ind off"
        : `/light ind ${indicators}`,
    );
  }

  toggleLights(lights: Exclude<HeadlightState, "off">) {
    if (!this.isConnected) return;

    this.sendCommand(
      this.carSwitchesState.head === lights
        ? "/light head off"
        : `/light head ${lights}`,
    );
  }
}

export const insimHub = new InSimHub();
