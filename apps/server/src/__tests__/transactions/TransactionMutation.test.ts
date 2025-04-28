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
    const sender = new Account({ accountNumber: 'SENDER005', balance: 0, userTaxId: 'TAX_SENDER5' });
    await sender.save();
    // Creates receiver with any balance
    const receiver = new Account({ accountNumber: 'RECEIVER005', balance: 1000, userTaxId: 'TAX_RECEIVER5' });
    await receiver.save();
    // Attempts a transaction with value > sender.balance
    const transactionData = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 1000,
      idempotentKey: 'TAXID006',
    };
    const transaction = new Transaction(transactionData);
    await expect(transaction.save()).rejects.toThrow();
  });

  it('should not create a transaction with duplicate idempotentKey', async () => {
    const sender = new Account({ accountNumber: 'SENDER004', balance: 1000, userTaxId: 'TAX_SENDER4' });
    await sender.save();
    const receiver = new Account({ accountNumber: 'RECEIVER004', balance: 500, userTaxId: 'TAX_RECEIVER4' });
    await receiver.save();
    const transactionData1 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 100,
      idempotentKey: 'TAXID005',
    };
    const transactionData2 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 200,
      idempotentKey: 'TAXID005',
    };
    const transaction1 = new Transaction(transactionData1);
    await transaction1.save();
    const transaction2 = new Transaction(transactionData2);
    await expect(transaction2.save()).rejects.toThrow();
  });

  it('should not create a transaction with duplicate receiverAccountId', async () => {
    const sender = new Account({ accountNumber: 'SENDER003', balance: 1000, userTaxId: 'TAX_SENDER3' });
    await sender.save();
    const receiver = new Account({ accountNumber: 'RECEIVER003', balance: 500, userTaxId: 'TAX_RECEIVER3' });
    await receiver.save();
    const transactionData1 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 100,
      idempotentKey: 'TAXID003',
    };
    const transactionData2 = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 200,
      idempotentKey: 'TAXID004',
    };
    const transaction1 = new Transaction(transactionData1);
    await transaction1.save();
    const transaction2 = new Transaction(transactionData2);
    await expect(transaction2.save()).rejects.toThrow();
  });

  it('should not create a transaction with duplicate senderAccountId', async () => {
    const sender = new Account({ accountNumber: 'SENDER002', balance: 1000, userTaxId: 'TAX_SENDER2' });
    await sender.save();
    const receiver = new Account({ accountNumber: 'RECEIVER002', balance: 500, userTaxId: 'TAX_RECEIVER2' });
    await receiver.save();
    const transactionData = {
      senderAccountId: sender._id,
      receiverAccountId: receiver._id,
      value: 100,
      idempotentKey: 'TAXID002',
    };
    const transaction1 = new Transaction(transactionData);
    await transaction1.save();
    const transaction2 = new Transaction({ ...transactionData });
    await expect(transaction2.save()).rejects.toThrow();
  });
});