class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (this.connection) return this.connection;

    try {
      //connection logic to implement depending on the database used
      this.connection = {}; // Example placeholder for the connection object

      console.log('🟢 Database connected successfully');
      return this.connection;
    } catch (error) {
      console.error('🔴 Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
    //graceful disconnection logic
      await (async () => {})(); // Example placeholder for disconnection logic
      console.log('🟡 Database disconnected');
      this.connection = null;
    }
  }
}