import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { NetworkResponse, PlayersById, TeamsResponse } from '../../../src/types/index.ts';
import { createApp } from '../../../server/app.ts';
import { betweennessFrom, normalizeBetweenness } from '../../../server/centrality.ts';
import type { BetweennessTask } from '../../../server/centrality-worker.ts';
import { NetworkService } from '../../../server/network-service.ts';
import { TemporalIndex } from '../../../server/temporal-index.ts';
import { WorkerPool } from '../../../server/worker-pool.ts';
import { largeLeague, smallLeague } from './fixtures.ts';

// the API over real worker threads, on a free port
const serve = async(players: PlayersById) => {
    const index = new TemporalIndex(players);
    const pool = new WorkerPool<BetweennessTask, Float64Array>(
        new URL('../../../server/centrality-worker.ts', import.meta.url),
        2
    );
    const server: Server = await new Promise(resolve => {
        const listening = createApp(index, new NetworkService(index, players, pool))
            .listen(0, () => resolve(listening));
    });
    const { port } = server.address() as AddressInfo;
    return {
        index,
        get: async<T>(path: string): Promise<{ status: number; body: T }> => {
            const response = await fetch(`http://localhost:${port}${path}`);
            return { status: response.status, body: await response.json() as T };
        },
        close: async() => {
            server.close();
            await pool.close();
        }
    };
};

describe('API', () => {
    let api: Awaited<ReturnType<typeof serve>>;

    beforeAll(async() => {
        api = await serve(smallLeague);
    });

    afterAll(() => api.close());

    describe('GET /api/network', () => {
        it('scores everyone in the range, the bridge first', async() => {
            const { status, body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987');
            expect(status).toEqual(200);
            expect(body.nodeCount).toEqual(4);
            expect(body.edgeCount).toEqual(4);
            expect(body.nodes.map(node => node.id)).toEqual(['c', 'a', 'b', 'd']);

            const [bridge] = body.nodes;
            expect(bridge).toMatchObject({ degree: 3, degreeCentrality: 1, betweennessRank: 1, seasons: 2 });
            // c is on the shortest path of 2 of the 3 pairs it is not part of: a-d and b-d
            expect(bridge.betweenness).toBeCloseTo(2 / 3);
        });

        it('shares a rank between equal scores', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987');
            const ranks = Object.fromEntries(body.nodes.map(node => [node.id, node.betweennessRank]));
            expect(ranks).toEqual({ c: 1, a: 2, b: 2, d: 2 });
        });

        it('marks Hall of Famers and drops the asterisk', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987');
            expect(body.nodes.find(node => node.id === 'a')).toMatchObject({ name: 'Player A', isHOFer: true });
        });

        it('limits the network to one team', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1990&team=bos');
            expect(body).toMatchObject({ team: 'BOS', nodeCount: 3, edgeCount: 3 });
            // c's Lakers season does not count towards a Boston network
            expect(body.nodes.find(node => node.id === 'c')?.seasons).toEqual(1);
        });

        it('sorts by degree, then name, and trims the list', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987&sort=degree&limit=2');
            expect(body).toMatchObject({ sort: 'degree', nodeCount: 4 });
            expect(body.nodes.map(node => node.id)).toEqual(['c', 'a']);
        });

        it('returns the focus player wherever they rank, even past the limit', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987&sort=degree&limit=1&focus=d');
            expect(body.nodes.map(node => node.id)).toEqual(['c']);
            expect(body.focus).toMatchObject({ id: 'd', degree: 1, degreeRank: 4 });
        });

        it('has no focus player when they did not play in the range', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987&focus=e');
            expect(body.focus).toBeNull();
            const unfocused = await api.get<NetworkResponse>('/api/network?startYear=1985&endYear=1987');
            expect(unfocused.body.focus).toBeNull();
        });

        it('defaults to every season in the data', async() => {
            const { body } = await api.get<NetworkResponse>('/api/network');
            expect(body).toMatchObject({ startYear: 1985, endYear: 1990, nodeCount: 5 });
        });

        it('turns down a malformed query', async() => {
            const cases: Array<[string, string]> = [
                ['startYear=1990&endYear=1985', 'startYear must not be after endYear'],
                ['startYear=1900', 'startYear must be a season\'s end year from 1985 to 1990'],
                ['endYear=soon', 'endYear must be a season\'s end year from 1985 to 1990'],
                ['team=NYK', 'No team with the code "NYK"'],
                ['sort=fame', 'sort must be one of betweenness, degree'],
                ['limit=0', 'limit must be a positive whole number'],
                ['focus=../etc', 'focus must be a Basketball-Reference player id, such as jamesle01'],
                ['team=BOS&team=LAL', 'team must be given once']
            ];
            for (const [query, error] of cases) {
                const response = await api.get<{ error: string }>(`/api/network?${query}`);
                expect(response).toEqual({ status: 400, body: { error } });
            }
        });
    });

    describe('GET /api/teams', () => {
        it('lists the teams with a season in the range', async() => {
            const { body } = await api.get<TeamsResponse>('/api/teams?startYear=1985&endYear=1986');
            expect(body).toEqual({ startYear: 1985, endYear: 1986, teams: ['BOS'] });
        });
    });

    it('answers an unknown endpoint with a 404', async() => {
        expect((await api.get('/api/players')).status).toEqual(404);
    });
});

describe('API on a network big enough to split across workers', () => {
    it('adds the workers’ shares up to the single-threaded scores', async() => {
        const players = largeLeague();
        const api = await serve(players);
        try {
            const { body } = await api.get<NetworkResponse>('/api/network');
            expect(body.nodeCount).toBeGreaterThan(400);

            const graph = api.index.subgraph(api.index.firstYear, api.index.lastYear);
            const expected = betweennessFrom(graph, 0, graph.ids.length);
            const byId = new Map(body.nodes.map(node => [node.id, node.betweenness]));
            graph.ids.forEach((id, node) => {
                expect(byId.get(id)).toBeCloseTo(normalizeBetweenness(expected[node], graph.ids.length), 12);
            });
        } finally {
            await api.close();
        }
    });
});
