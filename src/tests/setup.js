const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

/**
 * Connect to an in-memory MongoDB instance before running any tests.
 * This ensures tests are isolated and do not pollute your development database.
 */

beforeAll(async () =>{
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

/**
 * Clear all data between tests to prevent state leakage.
 * We delete documents rather than dropping collections to preserve indexes.
 */
afterEach(async () =>{
  const collections = mongoose.connection.collections
  for (const key in collections){
    await collections[key].deleteMany()
  }
})

/**
 * Disconnect Mongoose and stop the in-memory server after all tests.
 * This prevents Jest from hanging with open connections.
 */
afterAll(async () =>{
  await mongoose.connection.close()
  await mongoServer.stop()
})
