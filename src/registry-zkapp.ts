import { CID } from 'multiformats/cid';
import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PrivateKey,
  Poseidon,
  PublicKey,
  Circuit,
  isReady,
  Mina,
  UInt64,
  Party,
  Permissions,
  Bool,
  Encoding,
  CircuitValue,
  arrayProp,
} from 'snarkyjs';

await isReady;

const MAX_NAMES = 2;

class Resolver extends CircuitValue {
  @arrayProp(Field, MAX_NAMES) value: Field[];

  constructor(value: CID) {
    super();
    this.value = Encoding.bytesToFields(value.toV1().bytes);
  }

  toCID() {
    return CID.decode(Encoding.bytesFromFields(this.value));
  }

  static fromFields(fields: Field[]) {
    return new Resolver(CID.decode(Encoding.bytesFromFields(fields)));
  }
}

export default class RegistryApp extends SmartContract {
  // TODO: ideally, we have map<namehash, hash(pk_owner)>
  // and map<name, public_data>

  // possibly, this will be the "2 websites of Mina"

  @state(Field) subnode0 = State<Field>(); // name -> hash of public key
  @state(Field) resolver0_a = State<Field>(); // name -> cid
  @state(Field) resolver0_b = State<Field>();
  @state(Field) subnode1 = State<Field>();
  @state(Field) resolver1_a = State<Field>();
  @state(Field) resolver1_b = State<Field>();

  // initialization
  deploy(args: any) {
    super.deploy(args);

    this.self.update.permissions.setValue({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });

    this.subnode0.set(Field.zero); // this is the hash of the public key
    this.subnode1.set(Field.zero);
  }

  // fun fact is we could even just have a public key here
  // I'm unsure how the pk can be used, but I think it can
  @method register(sk: PrivateKey, subnode: Field) {
    // verifying the name is not registered yet
    // @dev to scale easily first, this is likely going to be a set of if condition
    const index = subnode.equals(0);
    const owner = Circuit.if(index, this.subnode0.get(), this.subnode1.get());
    owner.equals(Field.zero).assertEquals(true);

    const ownerValue = this.hash(sk.toPublicKey());
    this.subnode1.set(ownerValue);
    // Circuit.if(index, this.subnode0.set(ownerValue), this.subnode1.set(ownerValue))
  }

  @method setOwner(sk: PrivateKey, subnode: Field, newOwner: PublicKey) {
    const index = subnode.equals(0);
    const owner = Circuit.if(index, this.subnode0.get(), this.subnode1.get());

    owner.assertEquals(this.hash(sk.toPublicKey()));
    const ownerValue = this.hash(newOwner);

    Circuit.if(
      index,
      this.subnode0.set(ownerValue),
      this.subnode1.set(ownerValue)
    );
  }

  @method setResolver(sk: PrivateKey, subnode: Field, newResolver: Resolver) {
    const index = subnode.equals(0);
    const subnodeValue = Circuit.if(
      index,
      this.subnode0.get(),
      this.subnode1.get()
    );

    subnodeValue.assertEquals(this.hash(sk.toPublicKey()));

    const fResolver = newResolver.toFields();
    Field(fResolver.length).assertEquals(2);
    this.resolver1_a.set(fResolver[0]);
    this.resolver1_b.set(fResolver[1]);
    // Circuit.if(index, this.resolver0.set(newResolver), this.resolver1.set(newResolver))
  }

  hash(sk: PublicKey) {
    return Poseidon.hash(sk.toFields());
  }
}

// In fact, this is were we want to deploy
export class RegistryClient {
  registry: RegistryApp;

  constructor(address: PublicKey) {
    this.registry = new RegistryApp(address);
  }

  static async deploy(appSk: PrivateKey, eoaSk: PrivateKey) {
    let tx = Mina.transaction(eoaSk, () => {
      // TODO: I don't know what this balance is being used for
      const initialBalance = UInt64.fromNumber(1000000);
      const p = Party.createSigned(eoaSk, { isSameAsFeePayer: true });
      p.balance.subInPlace(initialBalance);
      let snapp = new RegistryApp(appSk.toPublicKey());
      snapp.deploy({ zkappKey: appSk });
      snapp.balance.addInPlace(initialBalance);
    });
    await tx.send().wait();
    return appSk.toPublicKey();
  }

  get state() {
    return Mina.getAccount(this.registry.address).zkapp.appState;
  }

  register(appSk: PrivateKey, sk: PrivateKey, subnode: string) {
    // For now, string are either 0 or 1
    const index = Number(subnode);
    const fSubnode = new Field(index);
    return Mina.transaction(sk, async () => {
      this.registry.register(sk, fSubnode);
      this.registry.self.sign(appSk);
      this.registry.self.body.incrementNonce = Bool(true);
    })
      .send()
      .wait();
  }

  resolver(subnode: string) {
    // For now, string are either 0 or 1
    const index = Number(subnode);
    const resolver_a = this.state[index * 3 + 1];
    const resolver_b = this.state[index * 3 + 2];
    const resolver = Resolver.fromFields([resolver_a, resolver_b]);
    return resolver.toCID();
  }

  setResolver(
    appSk: PrivateKey,
    sk: PrivateKey,
    subnode: string,
    resolver: CID
  ) {
    // For now, string are either 0 or 1
    const index = Number(subnode);
    return Mina.transaction(sk, () => {
      const fSubnode = Field(index);
      const fResolver = new Resolver(resolver);
      this.registry.setResolver(sk, fSubnode, fResolver);
      this.registry.self.sign(appSk);
      this.registry.self.body.incrementNonce = Bool(true);
    })
      .send()
      .wait();
  }
}
