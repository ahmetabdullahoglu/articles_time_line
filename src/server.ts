import app from './app';
// import { connectDB } from './config/database';

/**
 * Server configuration and startup
 */
class Server {
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.setupGracefulShutdown();
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // TODO: Connect to database (will be implemented in command 2)
      // await connectDB();
      // console.log('✅ Database connected successfully');
      console.log('📝 Database connection will be implemented in the next command');

      // Start the server
      const server = app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(`📡 API Base URL: http://localhost:${this.port}/api/v1`);
      });

      // Store server instance for graceful shutdown
      process.server = server;

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('💥 Uncaught Exception:', error);
      this.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown('unhandledRejection');
    });

    // Handle termination signals
    process.on('SIGTERM', () => {
      console.log('📋 Received SIGTERM signal');
      this.gracefulShutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('📋 Received SIGINT signal');
      this.gracefulShutdown('SIGINT');
    });
  }

  /**
   * Gracefully shutdown the server
   */
  private gracefulShutdown(signal: string): void {
    console.log(`🛑 Graceful shutdown initiated by ${signal}`);

    if (process.server) {
      process.server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connection
        // This will be implemented when we add database connection
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  }
}

// Extend the Process interface to include our server
declare global {
  namespace NodeJS {
    interface Process {
      server?: any;
    }
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});