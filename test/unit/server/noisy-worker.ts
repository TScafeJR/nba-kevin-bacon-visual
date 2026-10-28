// A worker that posts other messages beside its replies, the way every worker does under
// `node --watch`, which reports each module the thread imports.
import { parentPort } from 'node:worker_threads';
import { serveTasks } from '../../../server/worker-pool.ts';

parentPort?.postMessage({ 'watch:import': ['node:worker_threads'] });
parentPort?.postMessage({ 'watch:import': ['server/worker-pool.ts'] });

serveTasks<number, number>(value => {
    parentPort?.postMessage({ 'watch:import': ['a module loaded mid-task'] });
    return { output: value * 2 };
});
