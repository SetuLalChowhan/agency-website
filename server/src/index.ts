import { createApp } from "./app";
import { env } from "./config/env";
import { connectDb } from "./db/connect";
import { logger } from "./lib/logger";

async function main() {
  await connectDb();

  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`KERN CMS API listening on http://localhost:${env.port}`, {
      environment: env.nodeEnv,
    });
  });
}

main().catch((err) => {
  logger.error("Fatal startup error", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
});
