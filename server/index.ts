// The API: `make dev` runs it beside the Vite dev server, which proxies /api to it.
import { readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import type { PlayersById } from '../src/types/index.ts';
import { createApp } from './app.ts';
import type { BetweennessTask } from './centrality-worker.ts';
import { NetworkService } from './network-service.ts';
import { TemporalIndex } from './temporal-index.ts';
import { WorkerPool } from './worker-pool.ts';

const PORT = Number(process.env.API_PORT ?? 3001);

const players = JSON.parse(
    readFileSync(new URL('../src/data/players-obj.json', import.meta.url), 'utf8')
) as PlayersById;
const index = new TemporalIndex(players);
// one core stays free for the event loop, so requests are still answered while workers score
const pool = new WorkerPool<BetweennessTask, Float64Array>(
    new URL('./centrality-worker.ts', import.meta.url),
    availableParallelism() - 1
);
const service = new NetworkService(index, players, pool);

const server = createApp(index, service).listen(PORT, () => {
    console.log(`API on http://localhost:${PORT}, scoring with ${pool.size} workers`);
});

const shutDown = () => {
    server.close();
    pool.close().then(() => process.exit(0));
};
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
