import Web3 from "web3";
import {AbiItem} from "web3-utils";
import {Contract} from "web3-eth-contract";
import BN from "bn.js";
import {TransactionReceipt} from "web3-core";

type Listing = {
  id: string,
  network: Network,
  signature: string,
  unsignedContent: any,
  contractDetails: ContractDetails,
  accessType: ListingAccessType,
  priceInEth: number,
}

type ContractDetails = {
  type: ContractType,
  abi: string,
  address: string,
}

type StandardCollectionParams = {
  claimable: boolean,
  version: number,
  nonce: number,
  startPrice: string,
  endPrice: string,
  startTime: number,
  endTime: number,
  ipfsHash: string,
  claimedIpfsHash: string,
}

type RandomizedCollectionParams = {
  version: number,
  startPrice: string,
  endPrice: string,
  startTime: number,
  endTime: number,
  mintAmount: number,
}

type RandomizedCollectionRestrictedListingParams = {
  version: number,
  nonce: number,
  price: string,
  amount: number,
  allowedAddress: string,
}

enum ListingAccessType {
  General = "GENERAL",
  Restricted = "RESTRICTED",
}

enum ContractType {
  ERC721RandomizedCollectionV2 = "ERC721_RANDOMIZED_COLLECTION_V2",
  ERC721StandardCollection = "ERC721_STANDARD_COLLECTION",
}

type Network = "mainnet" | "rinkeby" | "localhost";

const getTotalPrice = (priceInWei: string, mintAmount: number) => {
  const price = new BN(priceInWei);
  const mintCount = new BN(mintAmount);
  return String(price.mul(mintCount));
}

const getListingEndpoint = (listingId: string, network: Network): string => {
  switch (network) {
    case "mainnet":
      return `https://api.easely.io/v1/listings/${listingId}`
    case "rinkeby":
    case "localhost":
      return `https://api.${network}.easely.io/v1/listings/${listingId}`
  }
}

const getListingFromNetwork = async (listingId: string, network: Network): Promise<Listing> => {
  const resp = await fetch(getListingEndpoint(listingId, network));
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  const respJSON = await resp.json();
  if (!respJSON) {
    throw new Error("listing not found")
  }

  respJSON.network = network;
  const priceInWei: string = respJSON.unsignedContent.startPrice || respJSON.unsignedContent.price;
  respJSON.priceInEth = Number(Web3.utils.fromWei(new BN(priceInWei), 'ether'));

  return Promise.resolve(respJSON as Listing);
}

const getListing = async (listingId: string): Promise<Listing> => {
  return getListingFromNetwork(listingId, "rinkeby");
}

const mintFromRandomizedListing = async (
  contract: Contract,
  listing: Listing,
  numberToMint: number,
  account: string,
): Promise<TransactionReceipt> => {
  const params = JSON.parse(listing.unsignedContent) as RandomizedCollectionParams;
  return await contract.methods.mint(
    params.version,
    params.mintAmount,
    numberToMint,
    [params.startPrice, params.endPrice, params.startTime, params.endTime],
    listing.signature,
  ).send({from: account, value: getTotalPrice(params.startPrice, numberToMint)});
}

const mintFromRandomizedListingRestricted = async (
  contract: Contract,
  listing: Listing,
  numberToMint: number,
  account: string,
): Promise<TransactionReceipt> => {
  const params = JSON.parse(listing.unsignedContent) as RandomizedCollectionRestrictedListingParams;
  return await contract.methods.mintAllow(
    params.allowedAddress,
    params.version,
    params.nonce,
    params.price,
    params.amount,
    numberToMint,
    listing.signature,
  ).send({from: account, value: getTotalPrice(params.price, numberToMint)});
}

const mintFromStandardListing = async (
  contract: Contract,
  listing: Listing,
  account: string,
): Promise<TransactionReceipt> => {
  const params = JSON.parse(listing.unsignedContent) as StandardCollectionParams;
  return await contract.methods.buyNewToken(
    params.claimable,
    params.version,
    params.nonce,
    [params.startPrice, params.endPrice, params.startTime, params.endTime],
    params.ipfsHash,
    params.claimedIpfsHash,
    listing.signature,
  ).send({from: account, value: params.startPrice});
}

const mintFromListing = async (
  web3: Web3,
  listing: Listing,
  numberToMint: number,
): Promise<TransactionReceipt> => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  const abi = JSON.parse(listing.contractDetails.abi)
  const mintingContract = new web3.eth.Contract(abi as AbiItem[], listing.contractDetails.address);
  switch (listing.contractDetails.type) {
    case ContractType.ERC721RandomizedCollectionV2:
      switch(listing.accessType) {
        case ListingAccessType.General:
          return mintFromRandomizedListing(mintingContract, listing, numberToMint, account);
        case ListingAccessType.Restricted:
          return mintFromRandomizedListingRestricted(mintingContract, listing, numberToMint, account);
      }
      break;
    case ContractType.ERC721StandardCollection:
      return mintFromStandardListing(mintingContract, listing, account);
  }
}

export {
  getListing,
  mintFromListing
};
export type { Listing };
