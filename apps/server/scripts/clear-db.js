// node apps/server/scripts/clear-db.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/woovi-playground'; // ajuste se necessário

async function clearCollections() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const collections = ['accounts', 'transactions']; // nomes exatos das coleções no banco
  for (const coll of collections) {
    try {
      await mongoose.connection.collection(coll).deleteMany({});
      console.log(`Cleared collection: ${coll}`);
    } catch (err) {
      console.error(`Error clearing ${coll}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Banco limpo com sucesso!');
}

clearCollections().catch(err => {
  console.error('Erro ao limpar o banco:', err);
  process.exit(1);
});