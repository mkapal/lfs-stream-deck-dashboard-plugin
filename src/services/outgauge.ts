import { OutGauge } from "node-insim";
import type { OutGaugePack } from "node-insim";

type Cfg = { host: string; port: number };
type Listener = (p: OutGaugePack) => void;

class OutGaugeHub {
  private cfg?: Cfg;
  private og?: OutGauge;
  private listeners = new Set<Listener>();
  private last?: OutGaugePack;

  async applyConfig(next: Cfg) {
    const changed =
      !this.cfg || this.cfg.host !== next.host || this.cfg.port !== next.port;
    this.cfg = next;

    if (changed) await this.restart();
    else this.startOnce();
  }

  private startOnce() {
    if (this.og) return;
    if (!this.cfg) throw new Error("OutGaugeHub not configured");

    this.og = new OutGauge();
    this.og.on("packet", (p: OutGaugePack) => {
      this.last = p;
      for (const cb of this.listeners) cb(p);
    });

    this.og.connect({ Host: this.cfg.host, Port: this.cfg.port });
    console.log(`OutGauge listening ${this.cfg.host}:${this.cfg.port}`);
  }

  async restart() {
    this.og?.disconnect?.();
    this.og?.removeAllListeners?.();
    this.og = undefined;
    this.last = undefined;

    this.startOnce();
  }

  subscribe(cb: Listener): () => void {
    this.startOnce();
    this.listeners.add(cb);
    if (this.last) cb(this.last); // instant sync for newly appeared actions
    return () => this.listeners.delete(cb);
  }
}

export const outGaugeHub = new OutGaugeHub();
