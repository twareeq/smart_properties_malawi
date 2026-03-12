import app from './app';
import { config } from './config/env';
import { prisma } from './config/prisma';

const startServer = async () => {
  try {
    // Check Database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    const port = config.port;
    app.listen(port, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unexpected closures
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
