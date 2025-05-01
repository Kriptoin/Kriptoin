// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UniversalKriptoinModule = buildModule("UniversalKriptoinModule", (m) => {
  const contract = m.contract("UniversalKriptoin", [
    "0xE66b474FDd3958bF7E25Fd189a62f911C6fCf384",
  ]);

  return { contract };
});

export default UniversalKriptoinModule;
