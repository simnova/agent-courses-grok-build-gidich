/**
 * Mongoose service wiring (for deployed + memory in tests).
 * TODO: export connectMongooseMemory() and prod connect when expanding beyond healthcheck.
 */
import mongoose from 'mongoose';

export async function ensureMongooseConnected(uri?: string): Promise<void> {
	const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/axc-dev';
	if (mongoose.connection.readyState !== 1) {
		await mongoose.connect(mongoUri);
	}
}

export { mongoose };
