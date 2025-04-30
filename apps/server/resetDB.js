// Script simples para limpar apenas Transaction e Account
const mongoose = require('mongoose');

// Conecte-se ao MongoDB - use a mesma string de conexão que seu aplicativo usa
// MongoDB local é geralmente mongodb://localhost:27017/woovi
const MONGO_URI = 'mongodb://localhost:27017/woovi';

async function resetCollections() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    console.log('Limpando coleções Transaction e Account...');
    
    // Limpar a coleção Transaction
    await mongoose.connection.collection('Transaction').deleteMany({});
    console.log('✓ Coleção Transaction limpa');
    
    // Limpar a coleção Account
    await mongoose.connection.collection('Account').deleteMany({});
    console.log('✓ Coleção Account limpa');
    
    console.log('Banco de dados limpo com sucesso! 🎉');
  } catch (error) {
    console.error('Erro ao limpar coleções:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetCollections();
