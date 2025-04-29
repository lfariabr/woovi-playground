import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Account } from '../../modules/account/AccountModel';

describe('AccountQuery', () => {
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

  it('should find account by accountNumber', async () => {
    const accountData = {
      name: 'Account 1',
      accountNumber: 'ACC002',
      balance: 200,
      userTaxId: 'TAX_ACC002',
    };
    const account = new Account(accountData);
    await account.save();
    const found = await Account.findOne({ accountNumber: 'ACC002' });
    expect(found).not.toBeNull();
    expect(found?.balance).toBe(200);
  });
});