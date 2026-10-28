// Rebuilds the player data in src/data/ from Basketball-Reference, mirrored as CSVs at
// github.com/sumitrodatta/bball-reference-datasets, and photo links from Wikimedia Commons:
//   player-data3.json, players-obj.json  players, their seasons and teammates
//   player-stats.json                    box score totals for each team season
//   player-photos.json                   a Commons thumbnail URL and credit per player
// Run it with `make data`; point SOURCE_COMMIT at a newer commit to pull in later seasons.
// The photos are only linked: the images stay on Wikimedia's servers.
import { writeFileSync } from 'node:fs';
import type {
    PhotosById,
    PlayerPhoto,
    Player,
    PlayersById,
    StatsById
} from '../src/types/index.ts';

// "2025-2026 end of season update"
const SOURCE_COMMIT = '76a70b41ad1c13948f25c62c921ed822e5db7f0e';
const SOURCE = `https://raw.githubusercontent.com/sumitrodatta/bball-reference-datasets/${SOURCE_COMMIT}/Data`;
const OUT_DIR = new URL('../src/data/', import.meta.url);

// Wikimedia asks API clients to identify themselves
const USER_AGENT = 'nba-kevin-bacon-visual (https://github.com/TScafeJR/nba-kevin-bacon-visual)';
const PHOTO_WIDTH = 250;
// Wikidata links a Basketball-Reference id (P2685, stored as "m/malonka01") to an image (P18)
const PHOTO_QUERY = 'SELECT ?bref ?image WHERE { ?player wdt:P2685 ?bref; wdt:P18 ?image }';
const COMMONS_BATCH = 50;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

type Row = Record<string, string>;

// enough of RFC 4180 for this data: college lists are quoted and contain commas
const parseCsv = (text: string): Row[] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoted) {
            if (char === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                quoted = false;
            } else {
                field += char;
            }
        } else if (char === '"') {
            quoted = true;
        } else if (char === ',') {
            row.push(field);
            field = '';
        } else if (char === '\n') {
            row.push(field.replace(/\r$/, ''));
            rows.push(row);
            row = [];
            field = '';
        } else {
            field += char;
        }
    }
    if (field || row.length) {
        row.push(field);
        rows.push(row);
    }

    const [header, ...body] = rows;
    return body
        .filter(cells => cells.length === header.length)
        .map(cells => Object.fromEntries(header.map((name, index) => [name, cells[index]])));
};

const fetchCsv = async(name: string): Promise<Row[]> => {
    const response = await fetch(`${SOURCE}/${encodeURIComponent(name)}.csv`);
    if (!response.ok) {
        throw new Error(`${name}.csv: HTTP ${response.status}`);
    }
    return parseCsv(await response.text());
};

const fetchJson = async<T>(url: string): Promise<T> => {
    const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT }
    });
    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
};

interface SparqlResponse {
    results: { bindings: Array<{ bref: { value: string }; image: { value: string } }> };
}

interface CommonsResponse {
    query: {
        normalized?: Array<{ from: string; to: string }>;
        pages: Array<{
            title: string;
            imageinfo?: Array<{
                thumburl: string;
                descriptionurl: string;
                extmetadata?: Record<string, { value: string } | undefined>;
            }>;
        }>;
    };
}

const orBlank = (value: string): string => value === 'NA' ? '' : value;

const toNumber = (value: string): number | null => {
    return value === 'NA' || value === '' ? null : Number(value);
};

// Commons credits are HTML: "<a href=...>Keith Allison</a> from Hanover, USA"
const stripHtml = (html: string): string => {
    return html
        // Commons repeats some names in a hidden span for its own tooling
        .replace(/<span[^>]*display:\s*none[^>]*>.*?<\/span>/gs, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
};

// 81 -> "6-9"
const formatHeight = (inches: string): string => {
    const total = Number(inches);
    return Number.isFinite(total) ? `${Math.floor(total / 12)}-${total % 12}` : '';
};

// 1963-07-24 -> "July 24, 1963"
const formatBirthDate = (date: string): string => {
    const [year, month, day] = date.split('-').map(Number);
    return year && month && day ? `${MONTHS[month - 1]} ${day}, ${year}` : '';
};

// season 1986 -> "NBA-UTA-1985-86", the key teammates are matched on
const teamKey = (row: Row): string => {
    const endYear = Number(row.season);
    return `${row.lg}-${row.team}-${endYear - 1}-${String(endYear).slice(2)}`;
};

// a traded player also gets a combined row (TOT, or 2TM, 3TM... since 2022) beside each stint
const isCombinedRow = (row: Row): boolean => row.team === 'TOT' || /^\dTM$/.test(row.team);

// the first Commons file name, alphabetically, for each player Wikidata has an image of
const fetchPhotoFiles = async(): Promise<Map<string, string>> => {
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(PHOTO_QUERY)}`;
    const { results } = await fetchJson<SparqlResponse>(url);
    const files = new Map<string, string>();
    results.bindings
        .map(binding => ({
            id: binding.bref.value.split('/').pop() ?? '',
            file: decodeURIComponent(binding.image.value.split('/').pop() ?? '')
        }))
        .sort((a, b) => a.file.localeCompare(b.file))
        .forEach(({ id, file }) => {
            if (!files.has(id)) {
                files.set(id, file);
            }
        });
    return files;
};

// thumbnail URL, file page and credit for each file name, asked of Commons in batches
const fetchPhotoCredits = async(files: string[]): Promise<Map<string, PlayerPhoto>> => {
    const credits = new Map<string, PlayerPhoto>();
    for (let start = 0; start < files.length; start += COMMONS_BATCH) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            formatversion: '2',
            prop: 'imageinfo',
            iiprop: 'url|extmetadata',
            iiurlwidth: String(PHOTO_WIDTH),
            iiextmetadatafilter: 'Artist|LicenseShortName',
            titles: files.slice(start, start + COMMONS_BATCH).map(file => `File:${file}`).join('|')
        });
        const { query } = await fetchJson<CommonsResponse>(`https://commons.wikimedia.org/w/api.php?${params}`);
        const requested = new Map((query.normalized ?? []).map(({ from, to }) => [to, from]));
        query.pages.forEach(page => {
            const [info] = page.imageinfo ?? [];
            if (!info) {
                return;
            }
            const file = (requested.get(page.title) ?? page.title).replace(/^File:/, '');
            credits.set(file, {
                url: info.thumburl.split('?')[0],
                page: info.descriptionurl,
                author: stripHtml(info.extmetadata?.Artist?.value ?? ''),
                license: info.extmetadata?.LicenseShortName?.value ?? ''
            });
        });
    }
    return credits;
};

const [seasons, careers, totals, photoFiles] = await Promise.all([
    fetchCsv('Player Season Info'),
    fetchCsv('Player Career Info'),
    fetchCsv('Player Totals'),
    fetchPhotoFiles()
]);

const teamsById = new Map<string, Set<string>>();
const rosters = new Map<string, Set<string>>();
seasons
    .filter(row => !isCombinedRow(row))
    // stable, so a season's stints stay in the order they were played
    .sort((a, b) => Number(a.season) - Number(b.season))
    .forEach(row => {
        const key = teamKey(row);
        teamsById.set(row.player_id, (teamsById.get(row.player_id) ?? new Set()).add(key));
        rosters.set(key, (rosters.get(key) ?? new Set()).add(row.player_id));
    });

const players: Player[] = careers
    .filter(row => teamsById.has(row.player_id))
    .map(row => {
        const teams = Array.from(teamsById.get(row.player_id) ?? []);
        const teammates = new Set(teams.flatMap(key => Array.from(rosters.get(key) ?? [])));
        teammates.delete(row.player_id);
        const isHOFer = row.hof === 'TRUE';
        return {
            career_start: row.from,
            career_end: row.to,
            position: orBlank(row.pos),
            height: formatHeight(row.ht_in_in),
            weight: orBlank(row.wt),
            birth_date: formatBirthDate(row.birth_date),
            colleges: orBlank(row.colleges),
            // Basketball-Reference marks Hall of Famers with an asterisk
            name: isHOFer ? `${row.player}*` : row.player,
            bref_id: row.player_id,
            bref_letter: row.player_id[0],
            teams,
            teammates: Array.from(teammates).sort(),
            isHOFer
        };
    })
    .sort((a, b) => a.bref_id.localeCompare(b.bref_id));

const missing = Array.from(teamsById.keys()).filter(id => !players.some(player => player.bref_id === id));
if (missing.length) {
    console.warn(`No career info for ${missing.length} players, left out: ${missing.join(', ')}`);
}

const playersById = players.reduce<PlayersById>((obj, player) => {
    obj[player.bref_id] = player;
    return obj;
}, {});

const stats = totals
    .filter(row => !isCombinedRow(row) && playersById[row.player_id])
    .reduce<StatsById>((obj, row) => {
        obj[row.player_id] = {
            ...obj[row.player_id],
            [teamKey(row)]: {
                g: Number(row.g) || 0,
                mp: toNumber(row.mp),
                fg: toNumber(row.fg),
                fga: toNumber(row.fga),
                trb: toNumber(row.trb),
                ast: toNumber(row.ast),
                pts: toNumber(row.pts)
            }
        };
        return obj;
    }, {});

const linkedFiles = Array.from(photoFiles)
    .filter(([id]) => playersById[id])
    .map(([, file]) => file);
const credits = await fetchPhotoCredits(Array.from(new Set(linkedFiles)).sort());
const photos = Array.from(photoFiles)
    .filter(([id, file]) => playersById[id] && credits.has(file))
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<PhotosById>((obj, [id, file]) => {
        obj[id] = credits.get(file) as PlayerPhoto;
        return obj;
    }, {});

writeFileSync(new URL('player-data3.json', OUT_DIR), JSON.stringify(players));
writeFileSync(new URL('players-obj.json', OUT_DIR), JSON.stringify(playersById));
writeFileSync(new URL('player-stats.json', OUT_DIR), JSON.stringify(stats));
writeFileSync(new URL('player-photos.json', OUT_DIR), JSON.stringify(photos));

const lastSeason = Math.max(...seasons.map(row => Number(row.season)));
console.log(`Wrote ${players.length} players, through the ${lastSeason - 1}-${String(lastSeason).slice(2)} season`);
console.log(`Box scores for ${Object.keys(stats).length} players, photos for ${Object.keys(photos).length}`);
