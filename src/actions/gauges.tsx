import { defineAction } from "@fcannizzaro/streamdeck-react";
import { OutGaugeFlags, type OutGaugePack } from "node-insim";

import { TextKey } from "../components/text-key";
import { useOutGauge } from "../hooks/use-outgauge";

function createGaugeKey(
  label: string,
  format: (p: OutGaugePack) => string,
  valueSize?: number,
) {
  return function GaugeKey() {
    const value = useOutGauge(format, "");

    return <TextKey label={label} value={value} valueSize={valueSize} />;
  };
}

function mapGear(gear: number): string {
  if (gear === 0) return "R";
  if (gear === 1) return "N";
  if (gear >= 2) return String(gear - 1);

  return "?";
}

function formatTurbo(p: OutGaugePack): string {
  const flags = p.Flags ?? 0;

  // Turbo gauge is not shown by the car
  if (!(flags & (OutGaugeFlags.OG_TURBO as number))) return "";

  return flags & (OutGaugeFlags.OG_BAR as number)
    ? `${p.Turbo.toFixed(1)} bar`
    : `${(p.Turbo * 14.5037738).toFixed(1)} psi`;
}

export const speedDisplayAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.speed-display",
  key: createGaugeKey("Speed", (p) => String(Math.round((p.Speed ?? 0) * 3.6))),
  info: {
    name: "Speed",
    icon: "imgs/actions/empty",
  },
});

export const rpmDisplayAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.rpm-display",
  key: createGaugeKey("RPM", (p) => String(Math.round(p.RPM ?? 0))),
  info: {
    name: "RPM",
    icon: "imgs/actions/empty",
  },
});

export const gearDisplayAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.gear-display",
  key: createGaugeKey("Gear", (p) => mapGear(p.Gear), 44),
  info: {
    name: "Gear",
    icon: "imgs/actions/empty",
  },
});

export const fuelPercentDisplayAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.fuel-percent",
  key: createGaugeKey("Fuel", (p) => `${((p.Fuel ?? 0) * 100).toFixed(1)}%`),
  info: {
    name: "Fuel %",
    icon: "imgs/actions/empty",
  },
});

export const turboDisplayAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.turbo",
  key: createGaugeKey("Turbo", formatTurbo, 24),
  info: {
    name: "Turbo Pressure",
    icon: "imgs/actions/empty",
  },
});

export const display1Action = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.display1",
  key: createGaugeKey("Display 1", (p) => p.Display1.trim(), 24),
  info: {
    name: "Display 1",
    icon: "imgs/actions/empty",
  },
});
