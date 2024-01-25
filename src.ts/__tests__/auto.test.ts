import { expect, jest } from "@jest/globals";

import { ethers } from "ethers";

import { whatsabi } from "../index";
import { autoload } from "../auto";

import { online_test } from "./env";


const { INFURA_API_KEY, ETHERSCAN_API_KEY } = process.env;
const provider = INFURA_API_KEY ? (new ethers.providers.InfuraProvider("homestead", INFURA_API_KEY)) : ethers.getDefaultProvider();


online_test('autoload selectors', async () => {
  const address = "0x4A137FD5e7a256eF08A7De531A17D0BE0cc7B6b6"; // Random unverified contract
  const abi = await autoload(address, {
    provider: provider,
    abiLoader: false,
    signatureLookup: false,
  });
  expect(abi).toContainEqual({"selector": "0x6dbf2fa0", "type": "function"});
  expect(abi).toContainEqual({"selector": "0xec0ab6a7", "type": "function"});
});

online_test('autoload selectors with experimental metadata', async () => {
  const address = "0x4A137FD5e7a256eF08A7De531A17D0BE0cc7B6b6"; // Random unverified contract
  const abi = await autoload(address, {
    provider: provider,
    abiLoader: false,
    signatureLookup: false,
    enableExperimentalMetadata: true,
  });
  expect(abi).toContainEqual({"inputs": [{"type": "bytes"}], "payable": true, "selector": "0x6dbf2fa0", "stateMutability": "payable", "type": "function"});
  expect(abi).toContainEqual({"inputs": [{"type": "bytes"}], "payable": true, "selector": "0xec0ab6a7", "stateMutability": "payable", "type": "function"});
});

jest.setTimeout(15000);

online_test('autoload full', async () => {
  const address = "0x4A137FD5e7a256eF08A7De531A17D0BE0cc7B6b6"; // Random unverified contract
  const abi = await autoload(address, {
    provider: provider,
    abiLoader: new whatsabi.loaders.MultiABILoader([
      new whatsabi.loaders.SourcifyABILoader(),
      new whatsabi.loaders.EtherscanABILoader({ apiKey: ETHERSCAN_API_KEY }),
    ]),
    signatureLookup: new whatsabi.loaders.MultiSignatureLookup([
      new whatsabi.loaders.OpenChainSignatureLookup(),
      new whatsabi.loaders.FourByteSignatureLookup(),
    ]),
    //onProgress: (phase: string, ...args: any[]) => { console.debug("PROGRESS", phase, args); },
  });
  expect(abi).toContainEqual({"constant": false, "inputs": [{"type": "address"}, {"type": "uint256"}, {"type": "bytes"}], "name": "call", "payable": false, "selector": "0x6dbf2fa0", "sig": "call(address,uint256,bytes)", "type": "function"})

  expect(abi).toContainEqual({"selector": "0xec0ab6a7", "type": "function"});
});
