import hre from "hardhat";
import { bscTestnet } from "viem/chains";

async function main() {
  const walletClient = (
    await hre.viem.getWalletClients({
      chain: bscTestnet,
    })
  )[0];

  const publicClient = await hre.viem.getPublicClient({
    chain: bscTestnet,
  });

  const { bytecode } = hre.artifacts.readArtifactSync("UniversalTipKu");

  const hash = await walletClient.sendTransaction({
    data: bytecode as `0x${string}`,
  });

  console.log("Hash:", hash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 2,
  });

  console.log("Contract Address:", receipt.contractAddress);

  await hre.run("verify:verify", {
    address: receipt.contractAddress!,
    contract: "contracts/UniversalTipKu.sol:UniversalTipKu",
    constructorArguments: [],
  });
}

main().catch((error) => console.log(error.message));
