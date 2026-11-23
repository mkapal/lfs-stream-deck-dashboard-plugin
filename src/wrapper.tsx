import { type ReactNode, useEffect } from "react";
import { useGlobalSettings } from "@fcannizzaro/streamdeck-react";
import streamDeck from "@elgato/streamdeck";

import { insimHub } from "./services/insim";
import { outGaugeHub } from "./services/outgauge";
import type { GlobalSettings } from "./types";

export function Wrapper({ children }: { children?: ReactNode }) {
  const [settings] = useGlobalSettings<GlobalSettings>();

  const insimHost = settings.insimHost || "127.0.0.1";
  const insimPort = Number(settings.insimPort || 29999);
  const insimAdmin = settings.insimAdmin ?? "";
  const outgaugeHost = settings.outgaugeHost || "127.0.0.1";
  const outgaugePort = Number(settings.outgaugePort || 30000);

  useEffect(() => {
    streamDeck.logger.info(
      `Applying globals: InSim ${insimHost}:${insimPort}, OutGauge ${outgaugeHost}:${outgaugePort}`,
    );

    void insimHub.applyConfig({
      host: insimHost,
      port: insimPort,
      admin: insimAdmin,
    });
    void outGaugeHub.applyConfig({ host: outgaugeHost, port: outgaugePort });
  }, [insimHost, insimPort, insimAdmin, outgaugeHost, outgaugePort]);

  return children;
}
