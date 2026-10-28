import { describe, expect, it } from 'vitest';

import {
    buildCareerLine,
    buildStatLine,
    formatPct,
    formatPerGame
} from '../../../../src/data/graph-methods/player-stats-methods';
import { StintTotals } from '../../../../src/types';

const stint = (overrides: Partial<StintTotals>): StintTotals => ({
    g: 10,
    mp: 300,
    fg: 40,
    fga: 100,
    trb: 50,
    ast: 30,
    pts: 100,
    ...overrides
});

describe('Player Stats Methods', () => {
    describe('buildStatLine', () => {
        it('averages counting stats over every game played', () => {
            const line = buildStatLine([stint({}), stint({ g: 30, pts: 600, trb: 150, ast: 90 })]);
            expect(line.games).toEqual(40);
            expect(line.points).toEqual(17.5);
            expect(line.rebounds).toEqual(5);
            expect(line.assists).toEqual(3);
        });

        it('leaves out the games of seasons that did not track a stat', () => {
            const line = buildStatLine([stint({ g: 60, trb: null }), stint({ g: 20, trb: 100 })]);
            expect(line.games).toEqual(80);
            expect(line.rebounds).toEqual(5);
        });

        it('weights field goal percentage by attempts', () => {
            const line = buildStatLine([stint({ fg: 10, fga: 20 }), stint({ fg: 30, fga: 80 })]);
            expect(line.fieldGoalPct).toEqual(0.4);
        });

        it('has no average for a stat no season tracked', () => {
            const line = buildStatLine([stint({ trb: null, fg: null, fga: null })]);
            expect(line.rebounds).toBeNull();
            expect(line.fieldGoalPct).toBeNull();
        });
    });

    describe('buildCareerLine', () => {
        it('combines every team season', () => {
            const line = buildCareerLine({
                'NBA-UTA-1985-86': stint({ g: 80, pts: 1200 }),
                'NBA-LAL-2003-04': stint({ g: 42, pts: 554 })
            });
            expect(line?.games).toEqual(122);
        });

        it('has no line for a player without box scores', () => {
            expect(buildCareerLine(undefined)).toBeNull();
        });
    });

    describe('formatting', () => {
        it('shows one decimal place, and a dash for untracked stats', () => {
            expect(formatPerGame(25.03)).toEqual('25.0');
            expect(formatPerGame(null)).toEqual('—');
            expect(formatPct(0.5161)).toEqual('51.6%');
            expect(formatPct(null)).toEqual('—');
        });
    });
});
