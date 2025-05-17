// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UniversalKriptoinModule = buildModule("UniversalKriptoinModule", (m) => {
  const contract = m.contract("UniversalKriptoinV1", [
    "0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22",
  ]);

  return { contract };
});

export default UniversalKriptoinModule;
