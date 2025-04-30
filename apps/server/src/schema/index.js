const { mergeTypeDefs } = require('@graphql-tools/merge');
const accountSchema = require('./account.schema');
const transactionSchema = require('./transaction.schema');
const commonSchema = require('./common.schema');

const typeDefs = mergeTypeDefs([
  commonSchema,
  accountSchema,
  transactionSchema,
]);

module.exports = { typeDefs };