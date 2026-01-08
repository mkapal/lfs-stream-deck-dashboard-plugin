import { InSim } from "node-insim";
import {
  InSimFlags,
  IS_ISI_ReqI,
  IS_TINY,
  PacketType,
  SmallType,
  TinyType,
} from "node-insim/packets";
import streamDeck from "@elgato/streamdeck";

type Cfg = { host: string; port: number; admin: string };

const indicatorStates = ["off", "left", "right", "all"] as const;
const headlightStates = ["off", "side", "low", "high"] as const;

type IndicatorState = (typeof indicatorStates)[number];
type HeadlightState = (typeof headlightStates)[number];

class InSimHub {
  private cfg?: Cfg;
  private insim: InSim = new InSim();
  private isConnecting = false;
  private isConnected = false;
  private carLightsInterval: NodeJS.Timeout | null = null;

  private carSwitchesState: {
    indicators: IndicatorState;
    head: HeadlightState;
    fogFront: boolean;
    fogRear: boolean;
  } = {
    indicators: "off",
    head: "off",
    fogFront: false,
    fogRear: false,
  };

  private switchesListeners = new Set<
    (s: typeof this.carSwitchesState) => void
  >();

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
      if (this.carLightsInterval) {
        clearInterval(this.carLightsInterval);
      }
    });

    this.insim.connect({
      IName: "StreamDeckDash",
      Host: this.cfg.host,
      Port: this.cfg.port,
      Admin: this.cfg.admin,
      Flags: InSimFlags.ISF_LOCAL,
      ReqI: IS_ISI_ReqI.SEND_VERSION,
    });

    this.insim.on(PacketType.ISP_VER, (packet) => {
      if (packet.ReqI === IS_ISI_ReqI.SEND_VERSION) {
        this.carLightsInterval = setInterval(() => {
          this.insim.send(
            new IS_TINY({
              ReqI: 1,
              SubT: TinyType.TINY_LCL,
            }),
          );
        }, 100);
      }
    });

    this.insim.on(PacketType.ISP_SMALL, (packet) => {
      if (packet.ReqI === 1 && packet.SubT === SmallType.SMALL_LCL) {
        const u = packet.UVal;
        const indicatorValue = (u & (3 << 16)) >> 16;
        const indicators = indicatorStates[indicatorValue] ?? "off";

        const headVal = (u & (3 << 18)) >> 18;

        const head = headlightStates[headVal] ?? "off";

        const fogFront = (u & (1 << 21)) >> 21 !== 0;
        const fogRear = (u & (1 << 20)) >> 20 !== 0;

        const next = { indicators, head, fogFront, fogRear } as const;
        const changed =
          next.indicators !== this.carSwitchesState.indicators ||
          next.head !== this.carSwitchesState.head ||
          next.fogFront !== this.carSwitchesState.fogFront ||
          next.fogRear !== this.carSwitchesState.fogRear;

        if (changed) {
          this.carSwitchesState = { ...next };
          for (const cb of this.switchesListeners) cb(this.carSwitchesState);
        }
      }
    });

    this.isConnecting = false;
  }

  subscribeCarSwitches(
    cb: (s: typeof this.carSwitchesState) => void,
  ): () => void {
    this.connectOnce();
    this.switchesListeners.add(cb);
    cb(this.carSwitchesState);
    return () => this.switchesListeners.delete(cb);
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

        if (this.carLightsInterval) {
          clearInterval(this.carLightsInterval);
        }

        this.connectOnce();
      });
    } else {
      streamDeck.logger.debug("Connecting");
      this.connectOnce();
    }
  }

  disconnect() {
    if (this.carLightsInterval) {
      clearInterval(this.carLightsInterval);
    }
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

  toggleIndicators(indicators: Exclude<IndicatorState, "off">) {
    if (!this.isConnected) {
      return;
    }

    if (this.carSwitchesState.indicators === indicators) {
      this.insim.sendMessage(`/light ind off`);
    } else {
      this.insim.sendMessage(`/light ind ${indicators}`);
    }
  }

  toggleLights(lights: Exclude<HeadlightState, "off">) {
    if (!this.isConnected) {
      return;
    }

    if (this.carSwitchesState.head === lights) {
      this.insim.sendMessage(`/light head off`);
    } else {
      this.insim.sendMessage(`/light head ${lights}`);
    }
  }
}

export const insimHub = new InSimHub();
