import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { TeamsResponse } from '../src/types/index.ts';
import type { NetworkService } from './network-service.ts';
import { parseNetworkQuery, parseRange } from './queries.ts';
import type { TemporalIndex } from './temporal-index.ts';

export const createApp = (index: TemporalIndex, service: NetworkService) => {
    const app = express();
    app.disable('x-powered-by');

    // GET /api/network?startYear=1980&endYear=2000&team=BOS&sort=degree&limit=25
    // everyone who played in the range, with their degree and betweenness centrality there
    app.get('/api/network', async(req, res) => {
        const query = parseNetworkQuery(req.query, index);
        if (!query.ok) {
            res.status(400).json({ error: query.error });
            return;
        }
        res.json(await service.network(query.value));
    });

    // GET /api/teams?startYear=1980&endYear=2000, the team codes with a season in the range
    app.get('/api/teams', (req, res) => {
        const range = parseRange(req.query, index);
        if (!range.ok) {
            res.status(400).json({ error: range.error });
            return;
        }
        const body: TeamsResponse = {
            ...range.value,
            teams: index.teamsInRange(range.value.startYear, range.value.endYear)
        };
        res.json(body);
    });

    app.use('/api', (_req: Request, res: Response) => {
        res.status(404).json({ error: 'No such endpoint' });
    });

    // express calls a four-argument handler with the errors routes throw, async ones included
    app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error(error);
        res.status(500).json({ error: 'Could not score the network' });
    });

    return app;
};
