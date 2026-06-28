/**
 * Minimal mongoose memory wiring for local dev / acceptance in worktrees.
 * Uses mongodb-memory-server-core to avoid postinstall hooks.
 *
 * Future expansion: real cluster uri selection based on env + WORKTREE_NAME.
 */

import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';

let memoryServer: MongoMemoryServer | null = null;

export async function startMongoMemory(): Promise<string> {
	if (memoryServer) {
		return memoryServer.getUri();
	}
	memoryServer = await MongoMemoryServer.create({
		instance: {
			// unique per worktree if WORKTREE_NAME present to allow parallel
			dbName: `axc-${process.env.WORKTREE_NAME || 'default'}`,
		},
	});
	const uri = memoryServer.getUri();
	await mongoose.connect(uri);
	return uri;
}

export async function stopMongoMemory(): Promise<void> {
	if (memoryServer) {
		await mongoose.disconnect();
		await memoryServer.stop();
		memoryServer = null;
	}
}

export { mongoose };
