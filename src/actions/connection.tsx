import { defineAction, useKeyDown } from "@fcannizzaro/streamdeck-react";

import { TextKey } from "../components/text-key";
import { insimHub } from "../services/insim";
import { outGaugeHub } from "../services/outgauge";

function ConnectionKey() {
  useKeyDown(() => {
    insimHub.reconnect();
    outGaugeHub.restart();
  });

  return <TextKey label="LFS" value="Connect" valueSize={24} />;
}

export const connectionAction = defineAction({
  uuid: "com.martinkapal.lfs.dashboard.connection",
  key: ConnectionKey,
  info: {
    name: "LFS Connection Settings",
    icon: "imgs/actions/empty",
    tooltip: "Configure global InSim + OutGauge connection",
  },
});
