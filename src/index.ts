import { CID } from 'multiformats/cid';
import { Mina, PrivateKey } from 'snarkyjs';
import { RegistryClient } from './registry-zkapp.js';

const main = async () => {
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const sk = Local.testAccounts[0].privateKey;

  const appSk = PrivateKey.random();

  console.log(`Deploying app at ${appSk.toPublicKey().toBase58()}`);
  const address = await RegistryClient.deploy(appSk, sk);
  console.log('Deployment successful');

  const client = new RegistryClient(address);

  console.log('Registering second domain');
  await client.register(appSk, sk, '1');

  console.log('Setting resolver for second domain');
  try {
    const cid = CID.parse('QmQzYrCh3yJeN9MSieh8MzMryZLQ3kKF99P1kNQDURyQAj');
    await client.setResolver(appSk, sk, '1', cid);
  } catch (e) {
    console.log('plop', e);
    return;
  }

  console.log('Retrieving resolver for second domain');
  const resolver = client.resolver('1');
  console.log('Resolver is:', resolver.toString());
};

main();
