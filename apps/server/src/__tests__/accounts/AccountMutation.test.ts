import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Account } from '../../modules/account/AccountModel';

describe('AccountMutation', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    const uri = await mongoServer.getUri();
    await mongoose.connect(uri, {});
    await Account.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Account.deleteMany({});
  });

  it('should update account balance', async () => {
    const account = new Account({ accountNumber: 'ACC001', balance: 100, userTaxId: 'TAX_ACC001', name: 'Account 1' });
    await account.save();
    account.balance = 500;
    await account.save();
    const updated = await Account.findOne({ accountNumber: 'ACC001' });
    expect(updated?.balance).toBe(500);
  });
});