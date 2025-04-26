import { RedisPubSub } from 'graphql-redis-subscriptions';

export const redisPubSub = new RedisPubSub({
	connection: process.env.REDIS_HOST,
});

console.log('Connecting to Redis:', {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASSWORD,
});