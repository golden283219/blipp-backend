import cors from 'cors';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import express from 'express';
import {graphqlHTTP} from 'express-graphql';
import fs from 'fs';
import {execute, subscribe} from 'graphql';
import {createServer as createServerHttp} from 'http';
import {createServer} from 'https';
import {createGraphQLSchema} from 'openapi-to-graphql';
import {Oas3} from 'openapi-to-graphql/lib/types/oas3';
import path from 'path';
import {SubscriptionServer} from 'subscriptions-transport-ws';
import {ApplicationConfig, BlippBackendApplication} from './application';
import pubsub from './pubsub';

dayjs.extend(utc);
dayjs.extend(timezone);

require('dotenv').config({path: `.env.${process.env.NODE_ENV}`});

const USE_CERTIFICATES =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

export * from './application';

const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../cert/privkey.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../cert/fullchain.pem')),
};

export async function main(options: ApplicationConfig = {}) {
  const defaultHost = USE_CERTIFICATES
    ? 'https://main.orderfyapi.link'
    : 'http://localhost';
  const url = `${process.env.HOST ?? defaultHost}:${process.env.PORT ?? 3000}`;
  options.rest.openApiSpec.servers = [{url}];
  const app = new BlippBackendApplication(options);
  await app.boot();
  await app.migrateSchema();
  await app.start();

  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const oas = await app.restServer.getApiSpec();
  const graphResult = await createGraphQLSchema(oas as Oas3, {
    viewer: false,
    createSubscriptionsFromCallbacks: true,
    fillEmptyResponses: true,
    singularNames: true,
    tokenJSONpath: '$.jwt',
  });

  const {schema} = graphResult;

  const expressApp = express();
  const corsOptions = {
    origin: '*',
    credentials: true,
  };
  expressApp.use(cors(corsOptions));
  expressApp.use((req: any, res: any, next: any) => {
    if (req?.headers?.authorization) {
      req.jwt = req.headers.authorization.replace(/^Bearer /, '');
    }
    next();
  });
  expressApp.use('/graphql', graphqlHTTP({schema, graphiql: true}));

  const wsServer = USE_CERTIFICATES
    ? createServer(httpsOptions, expressApp)
    : createServerHttp(expressApp);

  const graphqlPort = process.env.GRAPHQL_PORT ?? 3001;

  wsServer.listen(graphqlPort, () => {
    console.log('hosting graphql at ' + graphqlPort);
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: () => {
          console.log('Someone connected to subscription server');
          return {pubsub};
        },
        onDisconnect: async (webSocket: any, context: any) => {
          console.log(`Disconnect at ${dayjs().toISOString()}`);
          const initialContext = await context.initPromise;
          console.log(initialContext.pubsub.subscriptions);
        },
      },
      {server: wsServer, path: '/subscriptions'},
    );
  });

  console.log('graphqlServerAddress', wsServer.address());

  return app;
}

if (require.main === module) {
  // Run the application
  const httpsConfig = USE_CERTIFICATES
    ? {
        protocol: 'https',
        key: httpsOptions.key,
        cert: httpsOptions.cert,
      }
    : {};

  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      ...httpsConfig,
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
