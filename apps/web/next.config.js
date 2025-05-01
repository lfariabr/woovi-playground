module.exports = {
	reactStrictMode: true,
	transpilePackages: ['@woovi-playground/ui'],
	compiler: {
		relay: require('./relay.config'),
	},
	output: 'standalone',
	eslint: {
		ignoreDuringBuilds: true,
	}
};
