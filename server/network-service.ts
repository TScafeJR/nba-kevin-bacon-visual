import type {
    CentralityNode,
    CentralitySort,
    NetworkResponse,
    PlayersById
} from '../src/types/index.ts';
import { degrees, normalizeBetweenness, normalizeDegree } from './centrality.ts';
import type { BetweennessTask } from './centrality-worker.ts';
import type { Subgraph, TemporalIndex } from './temporal-index.ts';
import type { WorkerPool } from './worker-pool.ts';

export interface NetworkQuery {
    startYear: number;
    endYear: number;
    team: string | null;
    sort: CentralitySort;
    limit: number | null;
}

interface ScoredNetwork {
    nodes: CentralityNode[];
    edgeCount: number;
}

// below this many players one worker beats splitting the sources and adding the shares back up
const SPLIT_THRESHOLD = 400;
// more shares than workers, so a worker that finishes early takes another instead of idling
const SHARES_PER_WORKER = 4;
// scored networks kept for repeat requests; the data only changes with a rebuild
const CACHE_SIZE = 64;

// competition ranking, highest first: equal scores share a rank and the next one skips, 1, 2, 2, 4
const rank = (values: ArrayLike<number>): Int32Array => {
    const order = Array.from({ length: values.length }, (_, node) => node)
        .sort((a, b) => values[b] - values[a]);
    const ranks = new Int32Array(values.length);
    order.forEach((node, position) => {
        const previous = order[position - 1];
        // partial sums arrive in any order, so allow for rounding in what should be a tie
        const tied = position > 0 &&
            Math.abs(values[previous] - values[node]) <= 1e-12 * Math.max(1, Math.abs(values[node]));
        ranks[node] = tied ? ranks[previous] : position + 1;
    });
    return ranks;
};

// "NBA-UTA-1985-86" -> 1986, and the team code
const seasonOf = (key: string): { team: string; year: number } => {
    const [, team, startYear] = key.split('-');
    return { team, year: Number(startYear) + 1 };
};

export class NetworkService {
    private readonly index: TemporalIndex;
    private readonly players: PlayersById;
    private readonly pool: WorkerPool<BetweennessTask, Float64Array>;
    private readonly cache = new Map<string, Promise<ScoredNetwork>>();

    constructor(index: TemporalIndex, players: PlayersById, pool: WorkerPool<BetweennessTask, Float64Array>) {
        this.index = index;
        this.players = players;
        this.pool = pool;
    }

    async network(query: NetworkQuery): Promise<NetworkResponse> {
        const { startYear, endYear, team, sort, limit } = query;
        const { nodes, edgeCount } = await this.scored(startYear, endYear, team);
        const rankOf = (node: CentralityNode): number => {
            return sort === 'degree' ? node.degreeRank : node.betweennessRank;
        };
        const sorted = [...nodes].sort((a, b) => rankOf(a) - rankOf(b) || a.name.localeCompare(b.name));
        return {
            startYear,
            endYear,
            team,
            sort,
            nodeCount: nodes.length,
            edgeCount,
            nodes: limit ? sorted.slice(0, limit) : sorted
        };
    }

    // a cached network moves to the back of the queue, so the least recently asked for goes first
    private scored(startYear: number, endYear: number, team: string | null): Promise<ScoredNetwork> {
        const key = `${startYear}:${endYear}:${team ?? ''}`;
        const cached = this.cache.get(key);
        if (cached) {
            this.cache.delete(key);
            this.cache.set(key, cached);
            return cached;
        }

        // the promise is cached, so requests for a network still being scored wait on the same work
        const pending = this.score(startYear, endYear, team);
        this.cache.set(key, pending);
        pending.catch(() => this.cache.delete(key));
        if (this.cache.size > CACHE_SIZE) {
            this.cache.delete(this.cache.keys().next().value as string);
        }
        return pending;
    }

    private async score(startYear: number, endYear: number, team: string | null): Promise<ScoredNetwork> {
        const graph = this.index.subgraph(startYear, endYear, team ?? undefined);
        const count = graph.ids.length;
        const degree = degrees(graph);
        const betweenness = (await this.betweenness(graph)).map(raw => normalizeBetweenness(raw, count));
        const degreeRanks = rank(degree);
        const betweennessRanks = rank(betweenness);

        const nodes = graph.ids.map((id, node): CentralityNode => {
            const player = this.players[id];
            return {
                id,
                name: player.name.replace('*', ''),
                isHOFer: player.name.includes('*'),
                seasons: this.seasonsIn(id, startYear, endYear, team),
                degree: degree[node],
                degreeCentrality: normalizeDegree(degree[node], count),
                betweenness: betweenness[node],
                degreeRank: degreeRanks[node],
                betweennessRank: betweennessRanks[node]
            };
        });
        return { nodes, edgeCount: graph.edgeCount };
    }

    // Brandes' sources split into shares for the pool; each worker returns its share's partial
    // sums, which add up to the whole
    private async betweenness(graph: Subgraph): Promise<Float64Array> {
        const count = graph.ids.length;
        const shares = count < SPLIT_THRESHOLD ? 1 : this.pool.size * SHARES_PER_WORKER;
        const shareSize = Math.max(1, Math.ceil(count / shares));
        const tasks: Array<Promise<Float64Array>> = [];
        for (let first = 0; first < count; first += shareSize) {
            tasks.push(this.pool.run({
                offsets: graph.offsets,
                targets: graph.targets,
                firstSource: first,
                lastSource: Math.min(count, first + shareSize)
            }));
        }

        const total = new Float64Array(count);
        (await Promise.all(tasks)).forEach(partial => {
            partial.forEach((value, node) => {
                total[node] += value;
            });
        });
        return total;
    }

    private seasonsIn(id: string, startYear: number, endYear: number, team: string | null): number {
        const years = this.players[id].teams
            .map(seasonOf)
            .filter(season => season.year >= startYear && season.year <= endYear && (!team || season.team === team))
            .map(season => season.year);
        return new Set(years).size;
    }
}
