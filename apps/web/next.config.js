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
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://server:4000';
		return [
			{
				source: '/graphql',
				destination: `${apiUrl}/graphql`,
			},
			{
				source: '/graphql/:path*',
				destination: `${apiUrl}/graphql/:path*`,
			},
			// Adicionar rewrite para garantir que o healthcheck funcione
			{
				source: '/healthz',
				destination: '/api/health',
			},
		];
	},
};