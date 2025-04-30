const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const ENDPOINT = 'http://localhost:4000/graphql';
const SCHEMA_PATH = path.resolve(__dirname, '../schema/schema.graphql');

async function fetchIntrospection() {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `{
        __schema {
          mutationType { name fields { name args { name type { kind name ofType { name }}} type { name } } }
          types { name kind fields { name type { name kind ofType { name }}} inputFields { name type { name kind ofType { name }}} }
        }
      }`
    }),
  });
  return res.json();
}

function extractInputFieldsFromSDL(sdl, inputTypeName) {
  // Robustly extract fields from input type definition in SDL
  const regex = new RegExp(`input\\s+${inputTypeName}\\s*{([\\s\\S]*?)}\\s`, 'm');
  const match = sdl.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.replace(/#.*/, '')) // Remove inline comments
    .map(l => l.split(':')[0].trim())
    .filter(Boolean);
}

async function main() {
  const sdl = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const introspection = await fetchIntrospection();
  const schema = introspection.data.__schema;
  const mutationType = schema.mutationType;
  if (!mutationType) {
    console.error('Nenhum mutationType encontrado na introspecção!');
    process.exit(1);
  }
  console.log('--- Lista de mutations disponíveis e seus argumentos:');
  mutationType.fields.forEach(f => {
    console.log(`- ${f.name}(` + f.args.map(a => `${a.name}: ${a.type.name || (a.type.ofType && a.type.ofType.name)}`).join(', ') + ')');
  });
  const createTx = mutationType.fields.find(f => f.name === 'createTransaction');
  if (!createTx) {
    console.error('Mutation createTransaction NÃO encontrado no backend!');
    process.exit(1);
  }
  if (!createTx.args.length) {
    console.error('Mutation createTransaction NÃO possui argumentos! Veja acima como está exposto.');
    process.exit(1);
  }
  const inputTypeName = createTx.args[0]?.type?.name || createTx.args[0]?.type?.ofType?.name;
  console.log(`\nArgumento do mutation createTransaction: ${createTx.args[0].name}: ${inputTypeName}`);
  const inputType = schema.types.find(t => t.name === inputTypeName);

  // Compare input fields (robust SDL parsing)
  const sdlFields = extractInputFieldsFromSDL(sdl, inputTypeName);
  const backendFields = (inputType.inputFields || []).map(f => f.name);

  console.log('--- Backend mutation input type:', inputTypeName);
  console.log('Backend fields:', backendFields);
  console.log('Schema.graphql fields:', sdlFields);
  const missingInSDL = backendFields.filter(f => !sdlFields.includes(f));
  const extraInSDL = sdlFields.filter(f => !backendFields.includes(f));
  if (missingInSDL.length || extraInSDL.length) {
    console.warn('⚠️  Divergências encontradas!');
    if (missingInSDL.length) console.warn('No backend e NÃO no schema.graphql:', missingInSDL);
    if (extraInSDL.length) console.warn('No schema.graphql e NÃO no backend:', extraInSDL);
  } else {
    console.log('✅ Input fields estão alinhados!');
  }
}

main();
