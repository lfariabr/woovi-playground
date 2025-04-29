import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Transaction } from '../../modules/transaction/TransactionModel';
import { Account } from '../../modules/account/AccountModel';

describe('TransactionMutation', () => {
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

  it('should not create a transaction if account sender has no balance', async () => {
    // Creates sender with 0 balance
    const sender = new Account({ accountNumber: 'SENDER005', balance: 0, userTaxId: 'TAX_SENDER5', name: 'Sender 5' });
    await sender.save();
    // Creates receiver with any balance
    const receiver = new Account({ accountNumber: 'RECEIVER005', balance: 1000, userTaxId: 'TAX_RECEIVER5', name: 'Receiver 5' });
    await receiver.save();
    // Attempts a transaction with value > sender.balance
    const transactionData = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 1000,
      idempotentKey: 'TAXID006',
      createdAt: new Date(),
    };
    let error;
    try {
      await Transaction.create(transactionData);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toMatch(/insufficient/i);
  });

  it('should not create a transaction with duplicate idempotentKey', async () => {
    const sender = new Account({ accountNumber: 'SENDER004', balance: 1000, userTaxId: 'TAX_SENDER4', name: 'Sender 4' });
    await sender.save();
    const receiver = new Account({ accountNumber: 'RECEIVER004', balance: 500, userTaxId: 'TAX_RECEIVER4', name: 'Receiver 4' });
    await receiver.save();
    const transactionData1 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 100,
      idempotentKey: 'TAXID005',
      createdAt: new Date(),
    };
    await Transaction.create(transactionData1);
    const transactionData2 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 200,
      idempotentKey: 'TAXID005',
      createdAt: new Date(),
    };
    let error;
    try {
      await Transaction.create(transactionData2);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toMatch(/duplicate/i);
  });

  it('should not create a transaction with duplicate receiverAccountId', async () => {
    const sender = new Account({ accountNumber: 'SENDER003', balance: 1000, userTaxId: 'TAX_SENDER3', name: 'Sender 3' });
    await sender.save();
    const receiver = new Account({ accountNumber: 'RECEIVER003', balance: 500, userTaxId: 'TAX_RECEIVER3', name: 'Receiver 3' });
    await receiver.save();
    const transactionData1 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 100,
      idempotentKey: 'TAXID003',
      createdAt: new Date(),
    };
    await Transaction.create(transactionData1);
    const transactionData2 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 200,
      idempotentKey: 'TAXID004',
      createdAt: new Date(),
    };
    let error;
    try {
      await Transaction.create(transactionData2);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.message).toMatch(/duplicate/i);
  });
});