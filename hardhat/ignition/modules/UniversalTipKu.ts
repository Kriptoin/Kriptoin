// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UniversalTipKuModule = buildModule("UniversalTipKuModule", (m) => {
  const contract = m.contract("UniversalTipKu", ["0x3C361ccb8ED62468717EE7dF522d2d9Bc48a2A06"]);

  return { contract };
});

export default UniversalTipKuModule;
