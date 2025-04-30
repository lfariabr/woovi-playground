module.exports = {
  src: './src',
  artifactDirectory: './src/__generated__',
  // schema: './data/schema.graphql', -> Deixar um único...
  schema: '../server/schema/schema.graphql',
  exclude: [
    '**/node_modules/**',
    '**/.next/**',
    '**/__mocks__/**',
    '**/__generated__/**',
  ],
  language: 'typescript',
};