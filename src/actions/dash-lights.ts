import { defineAction } from "@fcannizzaro/streamdeck-react";
import { DashLights } from "node-insim";

import { useCarSwitches } from "../hooks/use-car-switches";
import { useOutGauge } from "../hooks/use-outgauge";
import { insimHub } from "../services/insim";
import { createIconKey, type IconState } from "./icon-key";

/** Dash light that the car may not have (`na`), and is either off or on. */
function useDashLight(light: DashLights): IconState {
  return useOutGauge(
    (p) =>
      (p.DashLights & light) === 0
        ? "na"
        : (p.ShowLights & light) !== 0
          ? "on"
          : "off",
    "na",
  );
}

function useSignal(mask: number, all = false): IconState {
  return useOutGauge((p): IconState => {
    const lit = p.ShowLights & mask;
    return (all ? lit === mask : lit !== 0) ? "on" : "off";
  }, "off");
}

const ENGINE_SEVERE_DAMAGE = 0x10000000;

function useEngineState(): IconState {
  return useOutGauge((p): IconState => {
    if ((p.DashLights & DashLights.DL_ENGINE) === 0) return "na";
    if ((p.ShowLights & DashLights.DL_ENGINE) === 0) return "off";
    return (p.ShowLights & ENGINE_SEVERE_DAMAGE) !== 0 ? "on" : "minor";
  }, "na");
}

function useSwitch(
  isOn: (s: ReturnType<typeof useCarSwitches>) => boolean,
): IconState {
  return isOn(useCarSwitches()) ? "on" : "off";
}

// Warning lights reported by OutGauge
export const shiftUpAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.shift-up",
  key: createIconKey("shift-up", () => useDashLight(DashLights.DL_SHIFT)),
  info: {
    name: "Shift Up",
    icon: "imgs/actions/shift-up-on",
  },
});
export const absAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.abs",
  key: createIconKey("abs", () => useDashLight(DashLights.DL_ABS)),
  info: {
    name: "ABS",
    icon: "imgs/actions/abs-on",
  },
});
export const batteryAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.battery",
  key: createIconKey("battery", () => useDashLight(DashLights.DL_BATTERY)),
  info: {
    name: "Battery Warning",
    icon: "imgs/actions/battery-on",
  },
});
export const fuelAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.fuel",
  key: createIconKey("fuel", () => useDashLight(DashLights.DL_FUELWARN)),
  info: {
    name: "Fuel Warning",
    icon: "imgs/actions/fuel-on",
  },
});
export const handbrakeAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.handbrake",
  key: createIconKey("handbrake", () => useDashLight(DashLights.DL_HANDBRAKE)),
  info: {
    name: "Handbrake",
    icon: "imgs/actions/handbrake-on",
  },
});
export const neutralAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.neutral",
  key: createIconKey("neutral", () => useDashLight(DashLights.DL_NEUTRAL)),
  info: {
    name: "Neutral",
    icon: "imgs/actions/neutral-on",
  },
});
export const oilPressureAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.oil-pressure",
  key: createIconKey("oil-pressure", () => useDashLight(DashLights.DL_OILWARN)),
  info: {
    name: "Oil Pressure",
    icon: "imgs/actions/oil-pressure-on",
  },
});
export const pitLimiterAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.pit-limiter",
  key: createIconKey("pit-limiter", () => useDashLight(DashLights.DL_PITSPEED)),
  info: {
    name: "Pit Limiter",
    icon: "imgs/actions/pit-limiter-on",
  },
});
export const tractionControlAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.traction-control",
  key: createIconKey("traction-control", () => useDashLight(DashLights.DL_TC)),
  info: {
    name: "Traction Control",
    icon: "imgs/actions/traction-control-on",
  },
});

export const engineAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.engine",
  key: createIconKey("engine", useEngineState),
  info: {
    name: "Engine Warning",
    icon: "imgs/actions/engine-on",
  },
});

// Indicators (state from OutGauge, toggled through InSim)
export const indicatorSharedAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.indicator-shared",
  key: createIconKey("indicator-shared", () =>
    useSignal(DashLights.DL_SIGNAL_ANY),
  ),
  info: {
    name: "Indicator (Any)",
    icon: "imgs/actions/indicator-shared-on",
  },
});
export const indicatorLeftAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.indicator-left",
  key: createIconKey(
    "indicator-left",
    () => useSignal(DashLights.DL_SIGNAL_L),
    () => insimHub.toggleIndicators("left"),
  ),
  info: {
    name: "Left Indicator",
    icon: "imgs/actions/indicator-left-on",
  },
});
export const indicatorRightAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.indicator-right",
  key: createIconKey(
    "indicator-right",
    () => useSignal(DashLights.DL_SIGNAL_R),
    () => insimHub.toggleIndicators("right"),
  ),
  info: {
    name: "Right Indicator",
    icon: "imgs/actions/indicator-right-on",
  },
});
export const indicatorHazardsAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.indicator-hazards",
  key: createIconKey(
    "indicator-hazards",
    () => useSignal(DashLights.DL_SIGNAL_L | DashLights.DL_SIGNAL_R, true),
    () => insimHub.toggleIndicators("all"),
  ),
  info: {
    name: "Hazards",
    icon: "imgs/actions/indicator-hazards-on",
  },
});

// Lights (state and control through InSim)
export const sidelightsAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.sidelights",
  key: createIconKey(
    "sidelights",
    () => useSwitch((s) => s.head === "side"),
    () => insimHub.toggleLights("side"),
  ),
  info: {
    name: "Sidelights",
    icon: "imgs/actions/sidelights-on",
  },
});
export const lowBeamAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.low-beam",
  key: createIconKey(
    "low-beam",
    () => useSwitch((s) => s.head === "low"),
    () => insimHub.toggleLights("low"),
  ),
  info: {
    name: "Low Beam",
    icon: "imgs/actions/low-beam-on",
  },
});
export const highBeamAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.high-beam",
  key: createIconKey(
    "high-beam",
    () => useSwitch((s) => s.head === "high"),
    () => insimHub.toggleLights("high"),
  ),
  info: {
    name: "High Beam",
    icon: "imgs/actions/high-beam-on",
  },
});
export const foglightFrontAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.foglight-front",
  key: createIconKey(
    "foglight-front",
    () => useSwitch((s) => s.fogFront),
    () => insimHub.sendCommand("/light ffog toggle"),
  ),
  info: {
    name: "Foglight Front",
    icon: "imgs/actions/foglight-front-on",
  },
});
export const foglightRearAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.foglight-rear",
  key: createIconKey(
    "foglight-rear",
    () => useSwitch((s) => s.fogRear),
    () => insimHub.sendCommand("/light rfog toggle"),
  ),
  info: {
    name: "Foglight Rear",
    icon: "imgs/actions/foglight-rear-on",
  },
});
