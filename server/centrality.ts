// Centrality on an unweighted, undirected graph in compressed sparse row form. Distance is
// counted in hops, the degrees of separation between teammates.

export interface CsrGraph {
    offsets: Int32Array;
    targets: Int32Array;
}

const nodeCount = (graph: CsrGraph): number => graph.offsets.length - 1;

// how many distinct teammates each player has in the graph
export const degrees = (graph: CsrGraph): Int32Array => {
    const result = new Int32Array(nodeCount(graph));
    for (let node = 0; node < result.length; node++) {
        result[node] = graph.offsets[node + 1] - graph.offsets[node];
    }
    return result;
};

// the share of the other players a player was teammates with
export const normalizeDegree = (degree: number, nodes: number): number => {
    return nodes > 1 ? degree / (nodes - 1) : 0;
};

// Brandes' algorithm (2001), run from sources firstSource up to but not including lastSource.
// Splitting the sources lets workers each take a share and the partial sums be added up. The
// sums count every pair from both ends, which normalizeBetweenness allows for.
export const betweennessFrom = (graph: CsrGraph, firstSource: number, lastSource: number): Float64Array<ArrayBuffer> => {
    const { offsets, targets } = graph;
    const n = nodeCount(graph);
    const centrality = new Float64Array(n);
    const paths = new Float64Array(n);
    const dependency = new Float64Array(n);
    const distance = new Int32Array(n).fill(-1);
    // nodes in the order the search reached them, so walking it backwards visits farthest first
    const order = new Int32Array(n);

    for (let source = firstSource; source < lastSource; source++) {
        paths[source] = 1;
        distance[source] = 0;
        order[0] = source;
        let head = 0;
        let tail = 1;
        while (head < tail) {
            const node = order[head++];
            for (let edge = offsets[node]; edge < offsets[node + 1]; edge++) {
                const next = targets[edge];
                if (distance[next] < 0) {
                    distance[next] = distance[node] + 1;
                    order[tail++] = next;
                }
                if (distance[next] === distance[node] + 1) {
                    paths[next] += paths[node];
                }
            }
        }

        for (let i = tail - 1; i > 0; i--) {
            const node = order[i];
            const share = (1 + dependency[node]) / paths[node];
            for (let edge = offsets[node]; edge < offsets[node + 1]; edge++) {
                const previous = targets[edge];
                if (distance[previous] === distance[node] - 1) {
                    dependency[previous] += paths[previous] * share;
                }
            }
            centrality[node] += dependency[node];
        }

        // reset only what this search touched
        for (let i = 0; i < tail; i++) {
            const node = order[i];
            paths[node] = 0;
            dependency[node] = 0;
            distance[node] = -1;
        }
    }
    return centrality;
};

// The share of shortest paths between other pairs of players that run through a player, from
// 0 to 1. The raw sums count each unordered pair twice, once from each end.
export const normalizeBetweenness = (raw: number, nodes: number): number => {
    return nodes > 2 ? raw / ((nodes - 1) * (nodes - 2)) : 0;
};
