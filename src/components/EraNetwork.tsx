import React, { ChangeEvent, Component, Fragment } from 'react';
import PlayerProfileCard from './presentational/PlayerProfileCard';
import TemporalSlider, { YearRange } from './presentational/TemporalSlider';
import { formatShare } from '../data/graph-methods/player-stats-methods';
import {
    CentralityNode,
    CentralitySort,
    NetworkResponse,
    PhotosById,
    TeamsResponse
} from '../types';
import '../style/EraNetwork.css';

interface CurrentPlayer {
    id: string;
    name: string;
    careerStart: number;
    careerEnd: number;
}

interface EraNetworkProps {
    player: CurrentPlayer;
    minYear: number;
    maxYear: number;
    photos: PhotosById | null;
    onSelectPlayer: (playerId: string) => void;
}

interface EraNetworkState {
    range: YearRange;
    // '' for every team
    team: string;
    sort: CentralitySort;
    // the range follows the current player's career until someone moves the slider
    followPlayer: boolean;
    playerId: string;
    status: 'loading' | 'ready' | 'error';
    // a long range takes seconds to score, so the status says so rather than looking stuck
    slow: boolean;
    network: NetworkResponse | null;
    teams: string[];
    activeId: string | null;
}

// two columns of five beside the profile card, which is about as tall
const LEADERS = 10;
// the slider moves a season at a time, so wait for it to settle before scoring a range
const DEBOUNCE_MS = 250;
const SLOW_MS = 1200;

const SORTS: Array<{ value: CentralitySort; label: string }> = [
    { value: 'betweenness', label: 'Bridging' },
    { value: 'degree', label: 'Teammates' }
];

// "BOS, 1986–2003", or "1986" for a single season
const formatEra = (startYear: number, endYear: number, team: string | null): string => {
    const years = startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
    return team ? `${team}, ${years}` : years;
};

const fetchJson = async<T,>(url: string, signal: AbortSignal): Promise<T> => {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
};

class EraNetwork extends Component<EraNetworkProps, EraNetworkState> {
    private request: AbortController | null = null;
    private debounce: number | undefined;
    private slowTimer: number | undefined;

    constructor(props: EraNetworkProps) {
        super(props);
        this.state = {
            range: [props.player.careerStart, props.player.careerEnd],
            team: '',
            sort: 'betweenness',
            followPlayer: true,
            playerId: props.player.id,
            status: 'loading',
            slow: false,
            network: null,
            teams: [],
            activeId: null
        };

        this.load = this.load.bind(this);
        this.onRangeChange = this.onRangeChange.bind(this);
        this.onTeamChange = this.onTeamChange.bind(this);
        this.matchCareer = this.matchCareer.bind(this);
        this.openNetwork = this.openNetwork.bind(this);
    }

    static getDerivedStateFromProps(props: EraNetworkProps, state: EraNetworkState) {
        const { player } = props;
        if (state.followPlayer && state.playerId !== player.id) {
            return { playerId: player.id, range: [player.careerStart, player.careerEnd] };
        }
        return null;
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps: EraNetworkProps, prevState: EraNetworkState) {
        const { range, team, sort } = this.state;
        // a new player on screen changes the focus tile even when the range stays put
        const newPlayer = prevProps.player.id !== this.props.player.id;
        if (newPlayer || range !== prevState.range || team !== prevState.team || sort !== prevState.sort) {
            this.scheduleLoad();
        }
    }

    componentWillUnmount() {
        this.request?.abort();
        window.clearTimeout(this.debounce);
        window.clearTimeout(this.slowTimer);
    }

    scheduleLoad() {
        window.clearTimeout(this.debounce);
        this.debounce = window.setTimeout(this.load, DEBOUNCE_MS);
    }

    // a newer request cancels the one before, so a slow range never overwrites a quick later one
    async load() {
        const { range: [startYear, endYear], team, sort } = this.state;
        this.request?.abort();
        const request = new AbortController();
        this.request = request;
        window.clearTimeout(this.slowTimer);
        this.slowTimer = window.setTimeout(() => this.setState(() => ({ slow: true })), SLOW_MS);
        this.setState(() => ({ status: 'loading', slow: false }));

        const range = new URLSearchParams({ startYear: String(startYear), endYear: String(endYear) });
        const query = new URLSearchParams({ ...Object.fromEntries(range), sort, limit: String(LEADERS), focus: this.props.player.id });
        if (team) {
            query.set('team', team);
        }

        try {
            const [network, teams] = await Promise.all([
                fetchJson<NetworkResponse>(`/api/network?${query}`, request.signal),
                fetchJson<TeamsResponse>(`/api/teams?${range}`, request.signal)
            ]);
            this.setState(({ activeId }) => ({
                status: 'ready',
                network,
                teams: teams.teams,
                activeId: network.nodes.some(node => node.id === activeId) ? activeId : network.nodes[0]?.id ?? null
            }));
        } catch {
            if (!request.signal.aborted) {
                this.setState(() => ({ status: 'error' }));
            }
        } finally {
            if (this.request === request) {
                window.clearTimeout(this.slowTimer);
                this.setState(() => ({ slow: false }));
            }
        }
    }

    onRangeChange(range: YearRange) {
        this.setState(() => ({ range, followPlayer: false }));
    }

    onTeamChange(e: ChangeEvent<HTMLSelectElement>) {
        const { value } = e.target;
        this.setState(() => ({ team: value }));
    }

    onSortChange(sort: CentralitySort) {
        this.setState(() => ({ sort }));
    }

    setActive(activeId: string) {
        if (activeId !== this.state.activeId) {
            this.setState(() => ({ activeId }));
        }
    }

    // the panel sits below the fold, so go back up to where the new network shows
    openNetwork(playerId: string) {
        this.props.onSelectPlayer(playerId);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    matchCareer() {
        const { player } = this.props;
        this.setState(() => ({
            followPlayer: true,
            playerId: player.id,
            range: [player.careerStart, player.careerEnd]
        }));
    }

    // the live region says what is loading; a finished load speaks through the tiles below
    renderStatus() {
        const { range: [startYear, endYear], team, status, slow } = this.state;
        if (status !== 'loading') {
            return '';
        }
        const era = formatEra(startYear, endYear, team || null);
        return slow
            ? `Scoring ${era}. Long ranges take a few seconds: every shortest path between players counts.`
            : `Scoring ${era}…`;
    }

    renderRow(node: CentralityNode, top: number, activeId: string | null) {
        const { sort } = this.state;
        const byDegree = sort === 'degree';
        const score = byDegree ? node.degree : node.betweenness;
        const classes = ['era-row'];
        if (node.id === activeId) {
            classes.push('is-active');
        }
        if (node.id === this.props.player.id) {
            classes.push('is-current');
        }
        return (
            <li key={node.id}>
                <button
                    type="button"
                    className={classes.join(' ')}
                    aria-pressed={node.id === activeId}
                    aria-controls="era-profile"
                    onMouseEnter={() => this.setActive(node.id)}
                    onFocus={() => this.setActive(node.id)}
                    onClick={() => this.setActive(node.id)}
                >
                    <span className="era-rank num">{byDegree ? node.degreeRank : node.betweennessRank}</span>
                    <span className="era-name">
                        <span className="era-label">{node.name}</span>
                        {node.isHOFer && <span className="pill">HOF</span>}
                    </span>
                    <span className="era-score num">{byDegree ? node.degree : formatShare(node.betweenness)}</span>
                    <span className="era-sub">
                        {node.seasons} season{node.seasons === 1 ? '' : 's'}
                        {' · '}
                        {byDegree ? `${formatShare(node.betweenness)} bridging` : `${node.degree} teammates`}
                    </span>
                    <span className="era-bar" aria-hidden="true">
                        <span style={{ width: `${top ? score / top * 100 : 0}%` }} />
                    </span>
                </button>
            </li>
        );
    }

    // the three tiles: how big the era's network is, and where the player on screen stands in it
    renderKpis() {
        const { player } = this.props;
        const { network, sort } = this.state;
        const loading = <span className="kpi-loading" aria-label="Loading" />;
        const focus = network?.focus ?? null;
        const rankOf = (node: CentralityNode) => sort === 'degree' ? node.degreeRank : node.betweennessRank;
        const era = network ? formatEra(network.startYear, network.endYear, network.team) : '';

        return (
            <Fragment>
                <dl className="panel kpi span-2">
                    <dt>Players</dt>
                    <dd className="kpi-value num">{network ? network.nodeCount.toLocaleString('en') : loading}</dd>
                    <dd className="kpi-sub">{network ? `played in ${era}` : ' '}</dd>
                </dl>
                <dl className="panel kpi span-2">
                    <dt>Teammate pairs</dt>
                    <dd className="kpi-value num">{network ? network.edgeCount.toLocaleString('en') : loading}</dd>
                    <dd className="kpi-sub">
                        {network && network.nodeCount > 1
                            ? `${(network.edgeCount / network.nodeCount * 2).toFixed(1)} teammates each, on average`
                            : ' '}
                    </dd>
                </dl>
                <dl className="panel kpi is-finding span-2">
                    <dt>{player.name}</dt>
                    {!network && <dd className="kpi-value">{loading}</dd>}
                    {network && focus &&
                        <Fragment>
                            <dd className="kpi-value num">
                                #{rankOf(focus).toLocaleString('en')}
                                <span className="kpi-unit">of {network.nodeCount.toLocaleString('en')}</span>
                            </dd>
                            <dd className="kpi-sub num">
                                {sort === 'degree'
                                    ? `${focus.degree} teammates · ${formatShare(focus.betweenness)} bridging`
                                    : `${formatShare(focus.betweenness)} bridging · ${focus.degree} teammates`}
                            </dd>
                        </Fragment>
                    }
                    {network && !focus &&
                        <Fragment>
                            <dd className="kpi-value is-missing">—</dd>
                            <dd className="kpi-sub">Did not play in {era}</dd>
                        </Fragment>
                    }
                </dl>
            </Fragment>
        );
    }

    renderBody() {
        const { photos } = this.props;
        const { status, network, activeId, sort } = this.state;
        if (status === 'error') {
            return (
                <div className="panel era-message span-6">
                    Couldn’t score this era.
                    <button type="button" className="era-retry" onClick={this.load}>Try again</button>
                </div>
            );
        }
        if (!network) {
            return (
                <section className="panel era-ranking span-4" aria-busy="true" aria-label="Loading the ranking">
                    <ol className="era-list">
                        {Array.from({ length: LEADERS }, (_, index) =>
                            <li key={index} className="era-row is-placeholder">
                                <span className="kpi-loading is-small" />
                            </li>
                        )}
                    </ol>
                </section>
            );
        }

        const era = formatEra(network.startYear, network.endYear, network.team);
        if (network.nodes.length === 0) {
            return (
                <p className="panel era-message span-6">
                    Nobody played for {network.team} in {era.replace(`${network.team}, `, '')}.
                </p>
            );
        }

        const active = network.nodes.find(node => node.id === activeId) ?? network.nodes[0];
        const [leader] = network.nodes;
        const top = sort === 'degree' ? leader.degree : leader.betweenness;
        const stale = status === 'loading';
        return (
            <Fragment>
                <section
                    className={stale ? 'panel era-ranking span-4 is-stale' : 'panel era-ranking span-4'}
                    aria-labelledby="era-ranking-title"
                    aria-busy={stale}
                >
                    <header className="panel-header">
                        <h3 id="era-ranking-title">Top {network.nodes.length} by {sort === 'degree' ? 'teammates' : 'bridging'}</h3>
                        <span className="panel-count">{era}</span>
                    </header>
                    <ol className="era-list" aria-label={`Most connected players, ${era}`}>
                        {network.nodes.map(node => this.renderRow(node, top, active.id))}
                    </ol>
                </section>
                <div id="era-profile" className={stale ? 'era-profile span-2 is-stale' : 'era-profile span-2'}>
                    <PlayerProfileCard
                        node={active}
                        nodeCount={network.nodeCount}
                        era={era}
                        photo={photos ? photos[active.id] ?? null : null}
                        onOpenNetwork={this.openNetwork}
                    />
                </div>
            </Fragment>
        );
    }

    render() {
        const { player, minYear, maxYear } = this.props;
        const { range: [startYear, endYear], team, sort, followPlayer, teams } = this.state;
        // the chosen team stays on the list even for a range it did not play in
        const teamOptions = team && !teams.includes(team) ? [...teams, team].sort() : teams;

        return (
            <Fragment>
                <header className="era-head span-6">
                    <h2 id="era-title">Most connected, {formatEra(startYear, endYear, team || null)}</h2>
                    <p className="panel-sub">
                        Bridging is betweenness centrality: the share of shortest teammate paths between other players that run through someone.
                    </p>
                </header>

                <div className="era-controls span-6">
                    <TemporalSlider label="Seasons" min={minYear} max={maxYear} value={[startYear, endYear]} onChange={this.onRangeChange} />
                    <label className="era-field">
                        <span className="era-field-label">Team</span>
                        <select className="field" value={team} onChange={this.onTeamChange}>
                            <option value="">All teams</option>
                            {teamOptions.map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                    </label>
                    <div className="era-field" role="group" aria-labelledby="era-sort-label">
                        <span id="era-sort-label" className="era-field-label">Rank by</span>
                        <div className="segmented">
                            {SORTS.map(option =>
                                <button
                                    key={option.value}
                                    type="button"
                                    className={sort === option.value ? 'is-selected' : undefined}
                                    aria-pressed={sort === option.value}
                                    onClick={() => this.onSortChange(option.value)}
                                >
                                    {option.label}
                                </button>
                            )}
                        </div>
                    </div>
                    {!followPlayer &&
                        <button type="button" className="era-retry era-match" onClick={this.matchCareer}>
                            Match {player.name}’s career
                        </button>
                    }
                </div>

                <p className="panel-sub era-status span-6" role="status">{this.renderStatus()}</p>
                {this.renderKpis()}
                {this.renderBody()}
            </Fragment>
        );
    }
}

export default EraNetwork;
