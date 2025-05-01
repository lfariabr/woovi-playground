module.exports = {
	reactStrictMode: true,
	transpilePackages: ['@woovi-playground/ui', '@mui/material', '@mui/system'],
	compiler: {
		relay: require('./relay.config'),
	},
	output: 'standalone',
	eslint: {
		ignoreDuringBuilds: true,
	},
	// Garante que o caminho base para os assets seja a raiz do aplicativo
	assetPrefix: '',
	// Configurações específicas para produção
	productionBrowserSourceMaps: true,
	// A opção experimental abaixo força o Next.js a usar file tracking
	// para incluir explicitamente os arquivos CSS no output standalone
	experimental: {
		outputFileTracingIncludes: {
			'/**/*.css': ['styles/**/*.css'],
		},
	},
	// Proxy /graphql para o backend Docker Compose
	async rewrites() {
		return [
			{
				source: '/graphql',
				destination: 'http://server:4000/graphql',
			},
			{
				source: '/graphql/:path*',
				destination: 'http://server:4000/graphql/:path*',
			},
		];
	},
};
