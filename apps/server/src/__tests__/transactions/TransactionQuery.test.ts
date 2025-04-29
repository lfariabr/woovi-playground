import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Transaction } from '../../modules/transaction/TransactionModel';
import { Account } from '../../modules/account/AccountModel';

describe('TransactionQuery', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    const uri = await mongoServer.getUri();
    await mongoose.connect(uri, {});
    await Transaction.syncIndexes();
    await Account.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Transaction.deleteMany({});
    await Account.deleteMany({});
  });

  it('should find transaction by idempotentKey', async () => {
    const senderData = {
      name: 'Account 1',
      accountNumber: 'ACC003',
      balance: 1000,
      userTaxId: 'TAX_ACC003',
    };
    const sender = new Account(senderData);
    await sender.save();
    const receiverData = {
      name: 'Account 2',
      accountNumber: 'ACC004',
      balance: 500,
      userTaxId: 'TAX_ACC004',
    };
    const receiver = new Account(receiverData);
    await receiver.save();
    const transaction = new Transaction({ senderAccountId: sender._id, receiverAccountId: receiver._id, value: 100, idempotentKey: 'TKEY1', createdAt: new Date() });
    await transaction.save();
    const found = await Transaction.findOne({ idempotentKey: 'TKEY1' });
    expect(found).not.toBeNull();
    expect(found?.senderAccountId.toString()).toBe(sender._id.toString());
  });
});