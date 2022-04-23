import { Mina, PrivateKey } from 'snarkyjs';

// eslint-disable-next-line no-unused-vars
const mina = Mina;

const generateKey = () => {
  return PrivateKey.random();
};

const main = () => {
  // Connect to the Mina Blockchain and sync

  // If a name is available, you can buy it
  // to buy it, you generate a key, store it in local storage, then upload the picture on IPFS
  // false condition to not trigger typescript issue
  if (Number(1) === 2) {
    generateKey();
  }

  // If no name are available, we should verify Alice and Bob proof
  // this is done by requesting the merkle path for the zkapp, and reading Alice and Bob name
  // the CID is then a simple 1:1 match

  // and that's it
};

window.addEventListener('load', main);
