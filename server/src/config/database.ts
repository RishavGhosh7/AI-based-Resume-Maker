import mongoose from 'mongoose';
import config from '../config';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📦 Database already connected');
      return;
    }

    try {
      const mongoUri = config.database.mongoUri;
      
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set');
      }

      console.log('🔄 Connecting to MongoDB...');
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log('✅ Successfully connected to MongoDB');

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔌 MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log('📦 Database already disconnected');
      return;
    }

    try {
      console.log('🔄 Disconnecting from MongoDB...');
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Successfully disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionHealth(): 'connected' | 'disconnected' {
    return this.isConnectionActive() ? 'connected' : 'disconnected';
  }
}

export default DatabaseConnection;