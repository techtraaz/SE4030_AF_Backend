/**
 * tests/integration/setup.js
 * Shared setup: spins up an in-memory MongoDB, connects Mongoose, and tears it down.
 * Imported by every integration test via Jest globalSetup / beforeAll hooks.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod;

/**
 * Start in-memory Mongo and connect Mongoose.
 * Call this in a beforeAll() inside each test suite.
 */
export const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { autoIndex: true });
};

/**
 * Drop all collections to isolate test suites.
 * Call this in a afterEach() to keep tests independent.
 */
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Disconnect Mongoose and stop the in-memory server.
 * Call this in an afterAll() inside each test suite.
 */
export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod.stop();
};
