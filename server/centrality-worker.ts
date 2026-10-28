// Runs on a worker thread: Brandes' algorithm from one share of a subgraph's sources. The graph
// arrives on SharedArrayBuffers, so it is read in place rather than copied.
import { betweennessFrom } from './centrality.ts';
import type { CsrGraph } from './centrality.ts';
import { serveTasks } from './worker-pool.ts';

export interface BetweennessTask extends CsrGraph {
    firstSource: number;
    lastSource: number;
}

serveTasks<BetweennessTask, Float64Array>(task => {
    const partial = betweennessFrom(task, task.firstSource, task.lastSource);
    return { output: partial, transfer: [partial.buffer] };
});
