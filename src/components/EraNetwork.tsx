import React, { ChangeEvent, Component } from 'react';
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

// two columns of six beside the profile card, which is about as tall
const LEADERS = 12;
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
        if (range !== prevState.range || team !== prevState.team || sort !== prevState.sort) {
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
        const query = new URLSearchParams({ ...Object.fromEntries(range), sort, limit: String(LEADERS) });
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

    renderStatus() {
        const { range: [startYear, endYear], team, status, slow, network } = this.state;
        if (status === 'loading') {
            const era = formatEra(startYear, endYear, team || null);
            return slow
                ? `Scoring ${era}. Long ranges take a few seconds: every shortest path between players counts.`
                : `Scoring ${era}…`;
        }
        if (status === 'ready' && network) {
            const era = formatEra(network.startYear, network.endYear, network.team);
            return `${network.nodeCount.toLocaleString('en')} players and ${network.edgeCount.toLocaleString('en')} teammate pairs in ${era}.`;
        }
        return '';
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

    renderBody() {
        const { photos } = this.props;
        const { status, network, activeId, sort } = this.state;
        if (status === 'error') {
            return (
                <div className="empty-state era-message">
                    Couldn’t score this era.
                    <button type="button" className="era-retry" onClick={this.load}>Try again</button>
                </div>
            );
        }
        if (!network) {
            return null;
        }

        const era = formatEra(network.startYear, network.endYear, network.team);
        if (network.nodes.length === 0) {
            return <p className="empty-state era-message">Nobody played for {network.team} in {era.replace(`${network.team}, `, '')}.</p>;
        }

        const active = network.nodes.find(node => node.id === activeId) ?? network.nodes[0];
        const [leader] = network.nodes;
        const top = sort === 'degree' ? leader.degree : leader.betweenness;
        return (
            <div className={status === 'loading' ? 'era-body is-stale' : 'era-body'} aria-busy={status === 'loading'}>
                <ol className="era-list" aria-label={`Most connected players, ${era}`}>
                    {network.nodes.map(node => this.renderRow(node, top, active.id))}
                </ol>
                <div id="era-profile" className="era-profile">
                    <PlayerProfileCard
                        node={active}
                        nodeCount={network.nodeCount}
                        era={era}
                        photo={photos ? photos[active.id] ?? null : null}
                        onOpenNetwork={this.openNetwork}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { player, minYear, maxYear } = this.props;
        const { range, team, sort, followPlayer, teams } = this.state;
        // the chosen team stays on the list even for a range it did not play in
        const teamOptions = team && !teams.includes(team) ? [...teams, team].sort() : teams;

        return (
            <section className="panel era" aria-labelledby="era-title">
                <header className="panel-header">
                    <div>
                        <h2 id="era-title">Most connected by era</h2>
                        <p className="panel-sub">
                            Who tied the league together: ranked by the teammate paths they bridge, or by how many teammates they had.
                        </p>
                    </div>
                    {!followPlayer &&
                        <button type="button" className="button button-secondary era-match" onClick={this.matchCareer}>
                            Match {player.name}’s career
                        </button>
                    }
                </header>

                <div className="era-controls">
                    <TemporalSlider label="Seasons" min={minYear} max={maxYear} value={range} onChange={this.onRangeChange} />
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
                </div>

                <p className="panel-sub era-status" role="status">{this.renderStatus()}</p>
                {this.renderBody()}
            </section>
        );
    }
}

export default EraNetwork;
