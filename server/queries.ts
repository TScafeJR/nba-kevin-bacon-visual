import type { CentralitySort } from '../src/types/index.ts';
import type { NetworkQuery } from './network-service.ts';
import type { TemporalIndex } from './temporal-index.ts';

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export interface RangeQuery {
    startYear: number;
    endYear: number;
}

type QueryString = Record<string, unknown>;

const SORTS: CentralitySort[] = ['betweenness', 'degree'];

// a single value, or undefined when the parameter is missing or empty
const single = (query: QueryString, name: string): Parsed<string | undefined> => {
    const value = query[name];
    if (value === undefined || value === '') {
        return { ok: true, value: undefined };
    }
    if (typeof value !== 'string') {
        return { ok: false, error: `${name} must be given once` };
    }
    return { ok: true, value: value.trim() };
};

const year = (query: QueryString, name: string, fallback: number, index: TemporalIndex): Parsed<number> => {
    const raw = single(query, name);
    if (!raw.ok || raw.value === undefined) {
        return raw.ok ? { ok: true, value: fallback } : raw;
    }
    const value = Number(raw.value);
    if (!/^\d{4}$/.test(raw.value) || value < index.firstYear || value > index.lastYear) {
        return {
            ok: false,
            error: `${name} must be a season's end year from ${index.firstYear} to ${index.lastYear}`
        };
    }
    return { ok: true, value };
};

// startYear and endYear are seasons' end years, both included; either defaults to the data's edge
export const parseRange = (query: QueryString, index: TemporalIndex): Parsed<RangeQuery> => {
    const startYear = year(query, 'startYear', index.firstYear, index);
    if (!startYear.ok) {
        return startYear;
    }
    const endYear = year(query, 'endYear', index.lastYear, index);
    if (!endYear.ok) {
        return endYear;
    }
    if (startYear.value > endYear.value) {
        return { ok: false, error: 'startYear must not be after endYear' };
    }
    return { ok: true, value: { startYear: startYear.value, endYear: endYear.value } };
};

export const parseNetworkQuery = (query: QueryString, index: TemporalIndex): Parsed<NetworkQuery> => {
    const range = parseRange(query, index);
    const team = single(query, 'team');
    const sort = single(query, 'sort');
    const limit = single(query, 'limit');
    const focus = single(query, 'focus');
    if (!range.ok) {
        return range;
    }
    if (!team.ok || !sort.ok || !limit.ok || !focus.ok) {
        return [team, sort, limit, focus].find(parsed => !parsed.ok) as Parsed<never>;
    }

    const teamCode = team.value?.toUpperCase();
    if (teamCode && !index.hasTeam(teamCode)) {
        return { ok: false, error: `No team with the code "${team.value}"` };
    }
    if (sort.value && !SORTS.includes(sort.value as CentralitySort)) {
        return { ok: false, error: `sort must be one of ${SORTS.join(', ')}` };
    }
    const count = Number(limit.value);
    if (limit.value && (!/^\d+$/.test(limit.value) || count < 1)) {
        return { ok: false, error: 'limit must be a positive whole number' };
    }
    if (focus.value && !/^[a-z0-9]{1,12}$/.test(focus.value)) {
        return { ok: false, error: 'focus must be a Basketball-Reference player id, such as jamesle01' };
    }

    return {
        ok: true,
        value: {
            ...range.value,
            team: teamCode ?? null,
            sort: (sort.value as CentralitySort | undefined) ?? 'betweenness',
            limit: limit.value ? count : null,
            focus: focus.value ?? null
        }
    };
};
