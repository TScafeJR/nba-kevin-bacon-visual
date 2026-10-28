import { describe, expect, it } from 'vitest';

import { TemporalIndex } from '../../../server/temporal-index.ts';
import type { Subgraph } from '../../../server/temporal-index.ts';
import { smallLeague } from './fixtures.ts';

const index = new TemporalIndex(smallLeague);

const neighbours = (graph: Subgraph, id: string): string[] => {
    const node = graph.ids.indexOf(id);
    return Array.from(graph.targets.slice(graph.offsets[node], graph.offsets[node + 1]))
        .map(target => graph.ids[target])
        .sort();
};

const playersOf = (rosters: ReturnType<TemporalIndex['rostersFor']>): string[] => {
    return rosters.flatMap(roster => Array.from(roster.players, player => index.playerIds[player])).sort();
};

describe('TemporalIndex', () => {
    it('knows the first and last seasons, by end year', () => {
        expect(index.firstYear).toEqual(1985);
        expect(index.lastYear).toEqual(1990);
    });

    it('looks up one team season directly', () => {
        expect(playersOf(index.rostersFor(1986, 'BOS'))).toEqual(['a', 'b', 'c']);
        expect(index.rostersFor(1987, 'BOS')).toEqual([]);
    });

    it('finds the rosters in a range, both ends included', () => {
        const rosters = index.rostersInRange(1986, 1987);
        expect(rosters.map(roster => `${roster.team} ${roster.year}`)).toEqual(['BOS 1986', 'LAL 1987']);
    });

    it('limits a range to one team', () => {
        const rosters = index.rostersInRange(1985, 1990, 'LAL');
        expect(rosters.map(roster => roster.year)).toEqual([1987, 1990]);
        expect(index.rostersInRange(1985, 1990, 'NYK')).toEqual([]);
    });

    it('lists the teams with a season in a range', () => {
        expect(index.teamsInRange(1985, 1986)).toEqual(['BOS']);
        expect(index.teamsInRange(1985, 1990)).toEqual(['BOS', 'LAL']);
    });

    it('links teammates once however many seasons they shared', () => {
        const graph = index.subgraph(1985, 1987);
        expect([...graph.ids].sort()).toEqual(['a', 'b', 'c', 'd']);
        expect(graph.edgeCount).toEqual(4);
        expect(neighbours(graph, 'a')).toEqual(['b', 'c']);
        expect(neighbours(graph, 'c')).toEqual(['a', 'b', 'd']);
        expect(neighbours(graph, 'd')).toEqual(['c']);
    });

    it('only links players through the seasons in the range', () => {
        const graph = index.subgraph(1987, 1990);
        expect([...graph.ids].sort()).toEqual(['c', 'd', 'e']);
        expect(neighbours(graph, 'c')).toEqual(['d']);
        expect(neighbours(graph, 'e')).toEqual([]);
    });

    it('has an empty subgraph for a range nobody played in', () => {
        const graph = index.subgraph(1988, 1989);
        expect(graph.ids).toEqual([]);
        expect(graph.edgeCount).toEqual(0);
    });
});
