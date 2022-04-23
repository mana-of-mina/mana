# Mana: More Anonymous Name Anchor

![Mana logo](./logo.png)

Mana is an anonymous name system built on top of Mina blockchain.
It allows users to anonymously register a name, and set which content it points to.

Due to technical limitation of the Mina snarkyjs library, only 2 names can be registered at the moment, denoted by Alice and Bob.

Accessing their content can be done securely through a browser in sync with Mina blockchain consensus. It's deployed on [IPFS](https://bafybeihudxwgfw2xc6w6yacqhmm2epa2kwdzdiq4uyqxgbwjnfs7pglsay.ipfs.cf-ipfs.com).
![Screenshot of Mana](./mana-of-mina-screenshot.png)

## What works

- The smart contract is deployed on a local version of Mina
- Users can register names, transfer its ownership, and assigned content identifier as a resolver to them
- The anonymisation is a hash of a public key. This works for limited setup

## What works on Mina protocol but for which there are no libraries

- Deploying the contract on the main chain
- Inter contract communiation, so the resolver is its own contract
- GraphQL endpoint on Mina to fetch the merkle path associated to a zkApp account
- Light Mina client that is in sync with the consensus, to verify the zkApp state from the browser

## Dependencies

- Node.js 16 or higher

## How to run

```sh
npm install
npm run start
```

## How to build

```sh
npm run build
```

## How to build

```sh
npm run build
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
