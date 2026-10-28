import { afterEach, describe, expect, it } from 'vitest';

import { WorkerPool } from '../../../server/worker-pool.ts';

describe('WorkerPool', () => {
    let pool: WorkerPool<number, number>;

    afterEach(() => pool.close());

    // under `node --watch` the pool once treated import reports as replies: each one put the
    // worker back on the idle list, so several tasks went to one worker and all but the last
    // never settled
    it('answers every task when workers post other messages too', async() => {
        pool = new WorkerPool(new URL('./noisy-worker.ts', import.meta.url), 2);
        const inputs = Array.from({ length: 24 }, (_, i) => i);
        const outputs = await Promise.all(inputs.map(input => pool.run(input)));
        expect(outputs).toEqual(inputs.map(input => input * 2));
    });

    it('turns tasks away once closed', async() => {
        pool = new WorkerPool(new URL('./noisy-worker.ts', import.meta.url), 1);
        await pool.close();
        await expect(pool.run(1)).rejects.toThrow('The worker pool is closed');
    });
});
