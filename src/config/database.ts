import mongoose from 'mongoose';

/**
 * Database configuration and connection management
 */
class DatabaseConnection {
  private isConnected = false;

  /**
   * Connect to MongoDB database
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📊 Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/article-archiver';
      
      // Updated options for newer mongoose/mongodb versions
      const options = {
        maxPoolSize: 10, // Maximum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        // Removed deprecated options: bufferMaxEntries, bufferCommands
      };

      await mongoose.connect(mongoUri, options);

      this.isConnected = true;
      console.log('✅ Database connected successfully');
      console.log(`📍 Connected to: ${mongoose.connection.host}:${mongoose.connection.port}`);
      console.log(`🗄️  Database: ${mongoose.connection.name}`);

      // Handle connection events
      this.setupConnectionEvents();

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB database
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
    }
  }

  /**
   * Setup database connection event handlers
   */
  private setupConnectionEvents(): void {
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    try {
      if (!mongoose.connection.db) {
        throw new Error('Database connection not established');
      }

      const admin = mongoose.connection.db.admin();
      const stats = await admin.serverStatus();
      
      return {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        collections: await mongoose.connection.db.listCollections().toArray(),
        version: stats.version,
        uptime: stats.uptime,
      };
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

// Export functions
export const connectDB = () => dbConnection.connect();
export const disconnectDB = () => dbConnection.disconnect();
export { dbConnection };

export default dbConnection;