import { StatLine, StintTotals } from '../../types';

type CountingStat = 'pts' | 'trb' | 'ast';

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

// averaged over only the games of seasons that tracked the stat, as Basketball-Reference does,
// so a career that began before rebounds were kept still gets a fair rebounding average
const perGame = (stints: StintTotals[], stat: CountingStat): number | null => {
    const tracked = stints.filter(stint => stint[stat] !== null && stint.g > 0);
    const games = sum(tracked.map(stint => stint.g));
    return games ? sum(tracked.map(stint => stint[stat] ?? 0)) / games : null;
};

const buildStatLine = (stints: StintTotals[]): StatLine => {
    const shooting = stints.filter(stint => stint.fg !== null && stint.fga);
    const attempts = sum(shooting.map(stint => stint.fga ?? 0));
    return {
        games: sum(stints.map(stint => stint.g)),
        points: perGame(stints, 'pts'),
        rebounds: perGame(stints, 'trb'),
        assists: perGame(stints, 'ast'),
        fieldGoalPct: attempts ? sum(shooting.map(stint => stint.fg ?? 0)) / attempts : null
    };
};

const buildCareerLine = (stats: Record<string, StintTotals> | undefined): StatLine | null => {
    return stats ? buildStatLine(Object.values(stats)) : null;
};

// 25.03 -> "25.0", untracked -> "—"
const formatPerGame = (value: number | null): string => value === null ? '—' : value.toFixed(1);

// 0.5161 -> "51.6%"
const formatPct = (value: number | null): string => {
    return value === null ? '—' : `${(value * 100).toFixed(1)}%`;
};

// 0.0518 -> "5.18%", for shares that can be tiny: those stay visible instead of rounding to 0
const formatShare = (share: number): string => {
    const percent = share * 100;
    if (percent === 0) {
        return '0%';
    }
    if (percent < 0.01) {
        return '<0.01%';
    }
    return `${percent.toFixed(percent >= 10 ? 1 : 2)}%`;
};

export {
    buildStatLine,
    buildCareerLine,
    formatPerGame,
    formatPct,
    formatShare
};
