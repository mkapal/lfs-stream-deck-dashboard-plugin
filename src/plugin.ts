import streamDeck from "@elgato/streamdeck";

import { insimHub } from "./services/insim";
import { outGaugeHub } from "./services/outgauge";

import { ConnectionAction } from "./actions/connection";
import { IndicatorLeftAction } from "./actions/indicator-left";
import { IndicatorRightAction } from "./actions/indicator-right";
import { IndicatorHazardsAction } from "./actions/indicator-hazards";

streamDeck.logger.setLevel("debug");

streamDeck.logger.debug("Initializing...");

type GlobalSettings = {
  insimHost?: string;
  insimPort?: number;
  insimAdmin?: string;
  outgaugeHost?: string;
  outgaugePort?: number;
};

function defaults(s?: GlobalSettings) {
  return {
    insimHost: s?.insimHost ?? "127.0.0.1",
    insimPort: Number(s?.insimPort ?? 29999),
    insimAdmin: s?.insimAdmin ?? "",
    outgaugeHost: s?.outgaugeHost ?? "127.0.0.1",
    outgaugePort: Number(s?.outgaugePort ?? 30000),
  };
}

async function applyGlobals(s?: GlobalSettings) {
  const c = defaults(s);
  streamDeck.logger.info(
    `Applying globals: InSim ${c.insimHost}:${c.insimPort}, OutGauge ${c.outgaugeHost}:${c.outgaugePort}`,
  );

  await insimHub.applyConfig({
    host: c.insimHost,
    port: c.insimPort,
    admin: c.insimAdmin,
  });
  await outGaugeHub.applyConfig({ host: c.outgaugeHost, port: c.outgaugePort });
}

(async () => {
  streamDeck.actions.registerAction(new ConnectionAction());
  streamDeck.actions.registerAction(new IndicatorLeftAction());
  streamDeck.actions.registerAction(new IndicatorRightAction());
  streamDeck.actions.registerAction(new IndicatorHazardsAction());

  streamDeck.logger.debug("Getting global settings...");
  // const gs = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
  // streamDeck.logger.debug("Global settings loaded");

  // await applyGlobals(gs);
  await applyGlobals();
  //
  // streamDeck.settings.onDidReceiveGlobalSettings(async (ev) => {
  //   await applyGlobals(ev.settings as GlobalSettings);
  // });

  streamDeck.logger.info("=== LFS plugin boot ===");
  streamDeck.connect();
})();

process.on("SIGINT", () => {
  insimHub.disconnect();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  streamDeck.logger.debug("Uncaught Exception:");
  streamDeck.logger.error(err);
  insimHub.disconnect();
  process.exit(1);
});
