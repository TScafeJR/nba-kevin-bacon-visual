import { describe, expect, it } from 'vitest';

import {
    betweennessFrom,
    degrees,
    normalizeBetweenness,
    normalizeDegree
} from '../../../server/centrality.ts';
import type { CsrGraph } from '../../../server/centrality.ts';

const graphOf = (nodes: number, edges: Array<[number, number]>): CsrGraph => {
    const lists = Array.from({ length: nodes }, (): number[] => []);
    edges.forEach(([a, b]) => {
        lists[a].push(b);
        lists[b].push(a);
    });
    const offsets = new Int32Array(nodes + 1);
    lists.forEach((list, node) => {
        offsets[node + 1] = offsets[node] + list.length;
    });
    return { offsets, targets: Int32Array.from(lists.flat()) };
};

const betweenness = (graph: CsrGraph): number[] => {
    const nodes = graph.offsets.length - 1;
    return Array.from(betweennessFrom(graph, 0, nodes), raw => normalizeBetweenness(raw, nodes));
};

describe('Centrality', () => {
    describe('degrees', () => {
        it('counts each node’s neighbours', () => {
            expect(Array.from(degrees(graphOf(3, [[0, 1], [1, 2]])))).toEqual([1, 2, 1]);
        });

        it('normalises by the other nodes there are to know', () => {
            expect(normalizeDegree(2, 3)).toEqual(1);
            expect(normalizeDegree(1, 5)).toEqual(0.25);
            expect(normalizeDegree(0, 1)).toEqual(0);
        });
    });

    describe('betweenness', () => {
        it('puts the middle of a path on every shortest path', () => {
            expect(betweenness(graphOf(3, [[0, 1], [1, 2]]))).toEqual([0, 1, 0]);
        });

        it('puts the centre of a star on every shortest path between leaves', () => {
            expect(betweenness(graphOf(5, [[0, 1], [0, 2], [0, 3], [0, 4]]))).toEqual([1, 0, 0, 0, 0]);
        });

        it('shares the credit between equally short paths', () => {
            // a square: opposite corners have two shortest paths, one through each other corner
            const scores = betweenness(graphOf(4, [[0, 1], [1, 2], [2, 3], [3, 0]]));
            scores.forEach(score => expect(score).toBeCloseTo(1 / 6));
        });

        it('scores nothing across a gap', () => {
            expect(betweenness(graphOf(4, [[0, 1], [2, 3]]))).toEqual([0, 0, 0, 0]);
        });

        it('adds up to the whole when the sources are split', () => {
            const graph = graphOf(6, [[0, 1], [1, 2], [2, 3], [3, 4], [1, 4], [4, 5]]);
            const whole = betweennessFrom(graph, 0, 6);
            const first = betweennessFrom(graph, 0, 2);
            const second = betweennessFrom(graph, 2, 6);
            whole.forEach((score, node) => expect(first[node] + second[node]).toBeCloseTo(score));
        });
    });
});
