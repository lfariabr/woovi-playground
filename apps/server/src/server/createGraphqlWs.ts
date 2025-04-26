import { Server as WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { schema } from '../schema/schema';
import { GraphQLSchema, execute, parse, subscribe, validate } from 'graphql';
import { Server } from 'http';
import { parse as urlParse } from 'url';

type CreateGraphQLServerOptions = {
	schema: GraphQLSchema;
	context: (() => unknown) | Record<string, unknown>;
};

export const createGraphqlWs = (
	server: Server,
	path: string,
	options: CreateGraphQLServerOptions
) => {
	// Create WebSocket server without protocol handling
	const wss = new WebSocketServer({
		noServer: true,
	});

	// Set up GraphQL WebSocket server with improved configuration
	useServer(
		{
			schema: options.schema,
			execute,
			subscribe,
			context: async () => {
				if (typeof options.context === 'function') {
					return options.context();
				}

				return options.context;
			},
			onConnect: (ctx) => {
				console.log(`Connected to ${path} Websocket`, {
					connectionParams: ctx.connectionParams,
				});

				return true; // Return true to accept the connection
			},
			onDisconnect: (ctx, code, reason) => {
				console.log(`Disconnected from ${path} WebSocket`, { code, reason });
			},
			onSubscribe: async (ctx, message) => {
				const { operationName, query, variables } = message.payload;
				console.log('Subscription request:', { operationName, variables });

				const document = typeof query === 'string' ? parse(query) : query;

				const args = {
					schema,
					operationName,
					document,
					variableValues: variables,
				};

				const validationErrors = validate(args.schema, args.document);

				if (validationErrors.length > 0) {
					console.error('Subscription validation errors:', validationErrors);
					return validationErrors;
				}

				return args;
			},
			onError: (ctx, message, errors) => {
				console.error('Subscription errors:', { 
					operationName: message.payload.operationName,
					errors 
				});
			},
		},
		wss
	);

	// Handle WebSocket upgrade requests with improved protocol handling
	server.on('upgrade', (request, socket, head) => {
		const { pathname } = urlParse(request.url);
		
		if (pathname === path) {
			console.log('WebSocket upgrade request for:', pathname);
			
			// Get protocol from headers
			const protocolHeader = request.headers['sec-websocket-protocol'] || '';
			const protocols = protocolHeader.split(',').map(p => p.trim());
			
			console.log('Requested protocols:', protocols);
			
			// Check for required protocol
			const graphqlWsProtocol = protocols.find(p => 
				p === 'graphql-transport-ws' || p === 'graphql-ws'
			);
			
			// Pass explicitly requested protocol to the WebSocket server
			wss.handleUpgrade(request, socket, head, (ws) => {
				if (graphqlWsProtocol) {
					// Set the protocol on the socket
					Object.defineProperty(ws, 'protocol', {
						value: graphqlWsProtocol,
						configurable: true
					});
					console.log(`Accepting protocol: ${graphqlWsProtocol}`);
				} else {
					console.log('No GraphQL WebSocket protocol specified by client');
				}
				
				console.log('WebSocket connection established');
				wss.emit('connection', ws, request);
				
				ws.on('message', (message) => {
					try {
						const parsedMessage = JSON.parse(message.toString());
						console.log('Message received:', parsedMessage.type || 'unknown type');
					} catch (e) {
						console.log('Raw message received (not JSON)');
					}
				});
				
				ws.on('error', (error) => {
					console.error('WebSocket error:', error);
				});
				
				ws.on('close', (code, reason) => {
					console.log('WebSocket closed:', { 
						code, 
						reason: reason ? reason.toString() : 'No reason' 
					});
				});
			});
		}
	});
};
