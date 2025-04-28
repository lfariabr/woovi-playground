import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Transaction } from '../../modules/transaction/TransactionModel';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const uri = await mongoServer.getUri();
  await mongoose.connect(uri, {});
  await Transaction.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Transaction.deleteMany({});
});

describe('TransactionModel', () => {
  it('should require all mandatory fields', async () => {
    const transaction = new Transaction({});
    let error;
    try {
      await transaction.validate();
    } catch (e: any) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.senderAccountId).toBeDefined();
    expect(error.errors.receiverAccountId).toBeDefined();
    expect(error.errors.value).toBeDefined();
    expect(error.errors.idempotentKey).toBeDefined();
  });

  it('should not allow non-numeric value', async () => {
    const transaction = new Transaction({
      senderAccountId: '507f1f77bcf86cd799439011',
      receiverAccountId: '507f1f77bcf86cd799439012',
      value: 'not-a-number',
      idempotentKey: 'KEY123',
    });
    let error;
    try {
      await transaction.validate();
    } catch (e: any) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.errors.value).toBeDefined();
  });
});