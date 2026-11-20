import { createServer } from "node:http";

import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { createSocketServer } from "./realtime/socket";

const httpServer = createServer(app);
createSocketServer(httpServer);

const shutdown = (signal: string) => {
  console.info(`Received ${signal}; shutting down ENGRAIN API.`);
  httpServer.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

httpServer.listen(env.PORT, () => {
  console.info(`ENGRAIN API listening on port ${env.PORT}`);
});
