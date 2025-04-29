import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Account } from '../../modules/account/AccountModel';

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

describe('AccountModel', () => {
  it('should create and retrieve an account', async () => {
    const accountData = {
      name: 'Account 1',
      accountNumber: '123456',
      balance: 1000,
      userTaxId: 'TAXID001',
    };

    const account = new Account(accountData);
    await account.save();

    const found = await Account.findOne({ userTaxId: 'TAXID001' });
    expect(found).not.toBeNull();
    expect(found?.accountNumber).toBe('123456');
    expect(found?.balance).toBe(1000);
  });

  it('should not create an account with duplicate userTaxId', async () => {
    const accountData = {
      name: 'Account 1',
      accountNumber: '123456',
      balance: 1000,
      userTaxId: 'TAXID001',
    };
  
    const account1 = new Account(accountData);
    await account1.save();
  
    const account2 = new Account({ ...accountData, accountNumber: '654321' });
    await expect(account2.save()).rejects.toThrow();
  });
  it('should not create an account with duplicate accountNumber', async () => {
    const accountData1 = {
      name: 'Account 1',
      accountNumber: '123457',
      balance: 1000,
      userTaxId: 'TAXID001',
    };
    const accountData2 = {
      name: 'Account 2',
      accountNumber: '123457', // duplicate accountNumber
      balance: 2000,
      userTaxId: 'TAXID002',
    };
  
    const account1 = new Account(accountData1);
    await account1.save();
  
    const account2 = new Account(accountData2);
    await expect(account2.save()).rejects.toThrow();
  });
});