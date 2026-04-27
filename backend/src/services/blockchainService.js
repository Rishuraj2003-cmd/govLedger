import crypto from "node:crypto";
import { ethers } from "ethers";

const contractAbi = [
  "function createProject(string name,uint256 budget,string department,string district,string timeline,address districtOfficer,address departmentHead) returns (uint256)",
  "function allocateFunds(uint256 projectId,address receiver,uint256 amount,string note)",
  "function transferFunds(uint256 projectId,address receiver,uint256 amount,string note)",
];

function isValidPrivateKey(key) {
  if (!key) return false;
  const clean = key.startsWith("0x") ? key.slice(2) : key;
  return /^[0-9a-fA-F]{64}$/.test(clean);
}

// Lazily check env at request-time (after dotenvx has loaded)
function getChainConfig() {
  const valid =
    Boolean(process.env.RPC_URL && process.env.CONTRACT_ADDRESS) &&
    isValidPrivateKey(process.env.PRIVATE_KEY);
  return { valid, rpcUrl: process.env.RPC_URL, privateKey: process.env.PRIVATE_KEY, contractAddress: process.env.CONTRACT_ADDRESS };
}

function buildWallet(config) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.contractAddress, contractAbi, wallet);
  return { contract };
}

export function getBlockchainMode() {
  return getChainConfig().valid ? "live-chain" : "mock-chain";
}

function mockTx(extra = {}) {
  return { txHash: `0x${crypto.randomBytes(32).toString("hex")}`, mode: "mock-chain", ...extra };
}

/* ─── createProject ─────────────────────────────────────── */
export async function createProjectOnChain(project) {
  const config = getChainConfig();
  if (!config.valid) {
    console.log("🔗 mock-chain: createProject", project.name);
    return mockTx({ projectId: project.id, chainProjectId: "" });
  }

  try {
    const { contract } = buildWallet(config);
    const args = [
      project.name,
      BigInt(project.budget),
      project.department,
      project.district,
      project.timeline || "",
      project.districtOfficer || ethers.ZeroAddress,
      project.departmentHead || ethers.ZeroAddress,
    ];

    // staticCall to get the return value (chain project ID) without spending gas
    const chainProjectId = await contract.createProject.staticCall(...args);

    // Now send the actual transaction
    const tx = await contract.createProject(...args);
    const receipt = await tx.wait();

    console.log(`✅ live-chain: createProject chainId=${chainProjectId}`);
    return { projectId: project.id, chainProjectId: chainProjectId.toString(), txHash: receipt.hash, mode: "live-chain" };
  } catch (err) {
    console.error("⚠️  createProjectOnChain failed, using mock:", err.shortMessage || err.message);
    return mockTx({ projectId: project.id, chainProjectId: "" });
  }
}

/* ─── allocateFunds ─────────────────────────────────────── */
// chainProjectId = the uint256 stored in MongoDB.chainProjectId (from createProject)
export async function allocateFundsOnChain(chainProjectId, receiver, amount, note) {
  const config = getChainConfig();
  if (!config.valid || !chainProjectId) {
    console.log("🔗 mock-chain: allocateFunds amount=", amount);
    return mockTx();
  }

  try {
    const { contract } = buildWallet(config);
    const safeId = BigInt(chainProjectId);
    const safeReceiver = ethers.isAddress(receiver) ? receiver : ethers.ZeroAddress;
    const tx = await contract.allocateFunds(safeId, safeReceiver, BigInt(amount), note || "");
    const receipt = await tx.wait();
    console.log(`✅ live-chain: allocateFunds chainId=${chainProjectId} amount=${amount}`);
    return { txHash: receipt.hash, mode: "live-chain" };
  } catch (err) {
    console.error("⚠️  allocateFundsOnChain failed, using mock:", err.shortMessage || err.message);
    return mockTx({ warning: err.shortMessage || err.message });
  }
}

/* ─── transferFunds ─────────────────────────────────────── */
export async function transferFundsOnChain(chainProjectId, receiver, amount, note) {
  const config = getChainConfig();
  if (!config.valid || !chainProjectId) {
    console.log("🔗 mock-chain: transferFunds amount=", amount);
    return mockTx();
  }

  try {
    const { contract } = buildWallet(config);
    const safeId = BigInt(chainProjectId);
    const safeReceiver = ethers.isAddress(receiver) ? receiver : ethers.ZeroAddress;
    const tx = await contract.transferFunds(safeId, safeReceiver, BigInt(amount), note || "");
    const receipt = await tx.wait();
    console.log(`✅ live-chain: transferFunds chainId=${chainProjectId} amount=${amount}`);
    return { txHash: receipt.hash, mode: "live-chain" };
  } catch (err) {
    console.error("⚠️  transferFundsOnChain failed, using mock:", err.shortMessage || err.message);
    return mockTx({ warning: err.shortMessage || err.message });
  }
}
