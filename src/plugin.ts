import streamDeck from "@elgato/streamdeck";
import {
  createPlugin,
  googleFont,
  physicalDevice,
} from "@fcannizzaro/streamdeck-react";

import { connectionAction } from "./actions/connection";
import {
  shiftUpAction,
  absAction,
  batteryAction,
  fuelAction,
  handbrakeAction,
  neutralAction,
  oilPressureAction,
  pitLimiterAction,
  tractionControlAction,
  engineAction,
  indicatorSharedAction,
  indicatorLeftAction,
  indicatorRightAction,
  indicatorHazardsAction,
  sidelightsAction,
  lowBeamAction,
  highBeamAction,
  foglightFrontAction,
  foglightRearAction,
} from "./actions/dash-lights";
import {
  speedDisplayAction,
  rpmDisplayAction,
  gearDisplayAction,
  fuelPercentDisplayAction,
  turboDisplayAction,
  display1Action,
} from "./actions/gauges";
import { insimHub } from "./services/insim";
import { Wrapper } from "./wrapper";

const roboto = await googleFont("Roboto");

const plugin = createPlugin({
  fonts: [roboto],
  actions: [
    connectionAction,
    shiftUpAction,
    absAction,
    batteryAction,
    fuelAction,
    handbrakeAction,
    neutralAction,
    oilPressureAction,
    pitLimiterAction,
    tractionControlAction,
    engineAction,
    indicatorSharedAction,
    indicatorLeftAction,
    indicatorRightAction,
    indicatorHazardsAction,
    sidelightsAction,
    lowBeamAction,
    highBeamAction,
    foglightFrontAction,
    foglightRearAction,
    speedDisplayAction,
    rpmDisplayAction,
    gearDisplayAction,
    fuelPercentDisplayAction,
    turboDisplayAction,
    display1Action,
  ],
  wrapper: Wrapper,
  adapter: physicalDevice(),
});

await plugin.connect();

process.on("SIGINT", () => {
  insimHub.disconnect();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  streamDeck.logger.error("Uncaught Exception:", err);
  insimHub.disconnect();
  process.exit(1);
});
