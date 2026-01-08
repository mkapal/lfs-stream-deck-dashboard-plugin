import streamDeck from "@elgato/streamdeck";

import { insimHub } from "./services/insim";
import { outGaugeHub } from "./services/outgauge";

import { ConnectionAction } from "./actions/connection";
import { IndicatorLeftAction } from "./actions/indicator-left";
import { IndicatorRightAction } from "./actions/indicator-right";
import { IndicatorHazardsAction } from "./actions/indicator-hazards";
import { IndicatorSharedAction } from "./actions/indicator-shared";
import { ShiftUpAction } from "./actions/shift-up";
import { SidelightsAction } from "./actions/sidelights";
import { AbsAction } from "./actions/abs";
import { BatteryAction } from "./actions/battery";
import { EngineAction } from "./actions/engine";
import { FoglightFrontAction } from "./actions/foglight-front";
import { FoglightRearAction } from "./actions/foglight-rear";
import { FuelAction } from "./actions/fuel";
import { HandbrakeAction } from "./actions/handbrake";
import { HighBeamAction } from "./actions/high-beam";
import { LowBeamAction } from "./actions/low-beam";
import { NeutralAction } from "./actions/neutral";
import { OilPressureAction } from "./actions/oil-pressure";
import { PitLimiterAction } from "./actions/pit-limiter";
import { TractionControlAction } from "./actions/traction-control";
import { Display1Action } from "./actions/display1";
import { SpeedDisplayAction } from "./actions/speed-display";
import { RPMDisplayAction } from "./actions/rpm-display";
import { GearDisplayAction } from "./actions/gear-display";
import { FuelPercentDisplayAction } from "./actions/fuel-percent-display";
import { TurboDisplayAction } from "./actions/turbo-display";

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
  streamDeck.actions.registerAction(new IndicatorSharedAction());
  streamDeck.actions.registerAction(new ShiftUpAction());
  streamDeck.actions.registerAction(new SidelightsAction());
  streamDeck.actions.registerAction(new AbsAction());
  streamDeck.actions.registerAction(new BatteryAction());
  streamDeck.actions.registerAction(new EngineAction());
  streamDeck.actions.registerAction(new FoglightFrontAction());
  streamDeck.actions.registerAction(new FoglightRearAction());
  streamDeck.actions.registerAction(new FuelAction());
  streamDeck.actions.registerAction(new HandbrakeAction());
  streamDeck.actions.registerAction(new HighBeamAction());
  streamDeck.actions.registerAction(new LowBeamAction());
  streamDeck.actions.registerAction(new NeutralAction());
  streamDeck.actions.registerAction(new OilPressureAction());
  streamDeck.actions.registerAction(new PitLimiterAction());
  streamDeck.actions.registerAction(new TractionControlAction());
  streamDeck.actions.registerAction(new Display1Action());
  streamDeck.actions.registerAction(new SpeedDisplayAction());
  streamDeck.actions.registerAction(new RPMDisplayAction());
  streamDeck.actions.registerAction(new GearDisplayAction());
  streamDeck.actions.registerAction(new FuelPercentDisplayAction());
  streamDeck.actions.registerAction(new TurboDisplayAction());

  streamDeck.logger.debug("Getting global settings...");
  // const gs = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
  // streamDeck.logger.debug("Global settings loaded");

  // await applyGlobals(gs);
  await applyGlobals({
    insimHost: "192.168.1.100",
    outgaugeHost: "0.0.0.0",
  });
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
