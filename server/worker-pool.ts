import { Worker, parentPort } from 'node:worker_threads';
import type { TransferListItem } from 'node:worker_threads';

interface Task<Input, Output> {
    id: number;
    input: Input;
    transfer: TransferListItem[];
    resolve: (output: Output) => void;
    reject: (error: Error) => void;
}

interface Request<Input> {
    id: number;
    input: Input;
}

interface Reply<Output> {
    id: number;
    output: Output;
}

const isReply = (message: unknown): message is Reply<unknown> => {
    return typeof message === 'object' && message !== null && 'id' in message && 'output' in message;
};

// Runs inside a worker: answers each task from the pool with handle's output, tagged with the
// task's id. The tag matters because a thread can post other messages too: under `node --watch`
// every worker reports each module it imports as {"watch:import": [...]}.
export const serveTasks = <Input, Output>(
    handle: (input: Input) => { output: Output; transfer?: TransferListItem[] }
) => {
    parentPort?.on('message', (message: Request<Input>) => {
        if (typeof message?.id !== 'number') {
            return;
        }
        const { output, transfer = [] } = handle(message.input);
        const reply: Reply<Output> = { id: message.id, output };
        parentPort?.postMessage(reply, transfer);
    });
};

// A fixed set of workers running one script, each taking one task at a time from a shared
// queue. A worker that crashes fails its task and is replaced.
export class WorkerPool<Input, Output> {
    readonly size: number;
    private readonly script: URL;
    private readonly idle: Worker[] = [];
    private readonly running = new Map<Worker, Task<Input, Output>>();
    private readonly queue: Array<Task<Input, Output>> = [];
    private nextId = 0;
    private closed = false;

    constructor(script: URL, size: number) {
        this.script = script;
        this.size = Math.max(1, size);
        for (let i = 0; i < this.size; i++) {
            this.idle.push(this.spawn());
        }
    }

    run(input: Input, transfer: TransferListItem[] = []): Promise<Output> {
        if (this.closed) {
            return Promise.reject(new Error('The worker pool is closed'));
        }
        return new Promise((resolve, reject) => {
            this.queue.push({ id: this.nextId++, input, transfer, resolve, reject });
            this.next();
        });
    }

    async close(): Promise<void> {
        this.closed = true;
        this.queue.splice(0).forEach(task => task.reject(new Error('The worker pool is closed')));
        const workers = [...this.idle, ...this.running.keys()];
        this.idle.length = 0;
        await Promise.all(workers.map(worker => worker.terminate()));
    }

    private spawn(): Worker {
        const worker = new Worker(this.script);
        worker.on('message', (message: unknown) => {
            const task = this.running.get(worker);
            // only the reply to the task this worker is running finishes it; anything else the
            // thread posts is ignored, so a worker is never put back on the idle list twice
            if (!task || !isReply(message) || message.id !== task.id) {
                return;
            }
            this.running.delete(worker);
            this.idle.push(worker);
            task.resolve(message.output as Output);
            this.next();
        });
        worker.on('error', error => {
            this.running.get(worker)?.reject(error);
            this.running.delete(worker);
        });
        worker.on('exit', () => {
            this.running.get(worker)?.reject(new Error('A centrality worker stopped unexpectedly'));
            this.running.delete(worker);
            const idleAt = this.idle.indexOf(worker);
            if (idleAt >= 0) {
                this.idle.splice(idleAt, 1);
            }
            if (!this.closed) {
                this.idle.push(this.spawn());
                this.next();
            }
        });
        return worker;
    }

    private next() {
        while (this.idle.length && this.queue.length) {
            const worker = this.idle.pop() as Worker;
            const task = this.queue.shift() as Task<Input, Output>;
            this.running.set(worker, task);
            const request: Request<Input> = { id: task.id, input: task.input };
            worker.postMessage(request, task.transfer);
        }
    }
}
