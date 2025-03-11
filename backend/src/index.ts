import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/use/ws';
import { WebSocketServer } from 'ws';
import cors from 'cors';
// import resolvers from './resolvers';
// import typeDefs from './typeDefs';


/**
 * Construct a GraphQL schema and define the necessary resolvers.
 *
 * type Query {
 *   hello: String
 * }
 * type Subscription {
 *   greetings: String
 * }
 */
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'world',
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: {
      greetings: {
        type: GraphQLString,
        subscribe: async function* () {
          for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
            yield { greetings: hi };
          }
        },
      },
    },
  }),
});

// const typeDefs = `
//   type Book {
//     title: String
//     author: String
//   }

//   type Query {
//     books: [Book]
//   }
// `;

// const books = [
//   {
//     title: 'The Awakening',
//     author: 'Kate Chopin',
//   },
//   {
//     title: 'City of Glass',
//     author: 'Paul Auster',
//   },
// ];

// book 데이터 반환 resolver
// const resolvers = {
//   Query: {
//     books: () => books,
//   },
// };

// apolloserver 와 websocket 서버에서 사용할 스키마를 생성
// const schema = makeExecutableSchema({ typeDefs, resolvers });

// WebSocket 서버와 ApolloServer 를 모두 HTTP 서버에 연결할 예정
const app = express();
const httpServer = createServer(app);

// 방금 생성한 http 서버를 이용한 websocket 서버 생성
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// 이 서버를 나중에 셧다운할 수 있도록 서버 정보를 반환
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
// 아폴로서버 세팅
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    // 서버 종료 시 apolloserver, websocket 서버 둘다 정리하기 위한 코드
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server),
);

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});

