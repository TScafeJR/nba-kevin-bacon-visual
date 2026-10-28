import React, { Component, KeyboardEvent } from 'react';
import Header from './presentational/static/Header';
import Footer from './presentational/static/Footer';
import PlayerSummary from './presentational/PlayerSummary';
import HopPath, { HopLink } from './presentational/HopPath';
import TeammateList from './presentational/TeammateList';
import SeasonStrip from './presentational/SeasonStrip';
import NetworkGraph from './NetworkGraph';
import EraNetwork from './EraNetwork';
import '../style/App.css';
import * as CONSTANTS from '../data/constants';
import playersObj from '../data/players-obj.json';
import { buildPlayerNetwork } from '../data/graph-methods/player-network-methods';
import { buildCareerLine } from '../data/graph-methods/player-stats-methods';
import { PhotosById, PlayerNetwork, StatsById } from '../types';

const HASH_PREFIX = '#/players/';
// the first hops offered while a path is a single stop
const SUGGESTED_HOPS = 3;
// networks kept for the stops on the path, which the links between them are read from
const NETWORK_CACHE_SIZE = 24;

type View = 'teammates' | 'era';

const VIEWS: Array<{ id: View; label: string }> = [
    { id: 'teammates', label: 'Teammates' },
    { id: 'era', label: 'Most connected by era' }
];

const playerIdFromHash = (): string | null => {
    const id = window.location.hash.startsWith(HASH_PREFIX) ? window.location.hash.slice(HASH_PREFIX.length) : '';
    return playersObj[id] ? id : null;
};

interface AppState {
    trail: string[];
    hoveredId: string | null;
    stats: StatsById | null;
    photos: PhotosById | null;
    view: View;
}

class App extends Component<object, AppState> {
    private readonly networks = new Map<string, PlayerNetwork>();

    constructor(props: object){
        super(props);
        this.state = {
            trail: [playerIdFromHash() || CONSTANTS.STARTING_INFO.centralPlayer.id],
            hoveredId: null,
            stats: null,
            photos: null,
            view: 'teammates'
        };

        this.handleHop = this.handleHop.bind(this);
        this.handleNewSearch = this.handleNewSearch.bind(this);
        this.handleOpenFromEra = this.handleOpenFromEra.bind(this);
        this.handleRandomPlayer = this.handleRandomPlayer.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.onTabKeyDown = this.onTabKeyDown.bind(this);
    }

    componentDidMount() {
        this.writeHash();
        this.loadStatsAndPhotos();
    }

    componentDidUpdate(prevProps: object, prevState: AppState) {
        if (prevState.trail !== this.state.trail) {
            this.writeHash();
        }
    }

    getCurrentId(): string {
        return this.state.trail[this.state.trail.length - 1];
    }

    networkOf(id: string): PlayerNetwork {
        const cached = this.networks.get(id);
        if (cached) {
            return cached;
        }
        const network = buildPlayerNetwork(id);
        this.networks.set(id, network);
        if (this.networks.size > NETWORK_CACHE_SIZE) {
            this.networks.delete(this.networks.keys().next().value as string);
        }
        return network;
    }

    // what joins each stop on the path to the next: the teams and seasons they shared
    hopLinks(): Array<HopLink | null> {
        const { trail } = this.state;
        return trail.slice(1).map((id, index) => {
            const link = this.networkOf(trail[index]).teammates.find(teammate => teammate.id === id);
            return link ? { franchises: link.franchises, yearSpan: link.yearSpan, seasonsTogether: link.seasonsTogether } : null;
        });
    }

    // box scores and photo links are big and not needed for the first paint, so they load after it
    async loadStatsAndPhotos() {
        const [stats, photos] = await Promise.all([
            import('../data/player-stats.json'),
            import('../data/player-photos.json')
        ]);
        this.setState(() => ({ stats: stats.default, photos: photos.default }));
    }

    writeHash() {
        window.history.replaceState(null, '', `${HASH_PREFIX}${this.getCurrentId()}`);
    }

    // a hop extends the path; hopping back to a player already on it cuts the path there
    handleHop(playerId: string){
        this.setState(({ trail }) => {
            const existing = trail.indexOf(playerId);
            return {
                trail: existing >= 0 ? trail.slice(0, existing + 1) : [...trail, playerId],
                hoveredId: null
            };
        });
    }

    // a search starts a new path
    handleNewSearch(playerId: string){
        this.setState(() => ({ trail: [playerId], hoveredId: null }));
    }

    // a player opened from the era ranking starts a new path, on their teammates
    handleOpenFromEra(playerId: string){
        this.setState(() => ({ trail: [playerId], hoveredId: null, view: 'teammates' }));
    }

    handleRandomPlayer(){
        const currentId = this.getCurrentId();
        const others = CONSTANTS.HOF_PLAYERS.filter(player => player.bref_id !== currentId);
        this.handleNewSearch(others[Math.floor(Math.random() * others.length)].bref_id);
    }

    handleHover(playerId: string | null){
        if (playerId !== this.state.hoveredId) {
            this.setState(() => ({ hoveredId: playerId }));
        }
    }

    selectView(view: View) {
        this.setState(() => ({ view }));
    }

    // the arrow keys move between tabs, as on any tab list
    onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
            return;
        }
        e.preventDefault();
        const at = VIEWS.findIndex(view => view.id === this.state.view);
        const next = VIEWS[(at + (e.key === 'ArrowRight' ? 1 : -1) + VIEWS.length) % VIEWS.length];
        this.selectView(next.id);
        document.getElementById(`tab-${next.id}`)?.focus();
    }

    renderTabs() {
        const { view } = this.state;
        return (
            <div className="view-tabs span-6" role="tablist" aria-label="Views" onKeyDown={this.onTabKeyDown}>
                {VIEWS.map(option =>
                    <button
                        key={option.id}
                        id={`tab-${option.id}`}
                        type="button"
                        role="tab"
                        className="view-tab"
                        aria-selected={view === option.id}
                        aria-controls={`view-${option.id}`}
                        tabIndex={view === option.id ? 0 : -1}
                        onClick={() => this.selectView(option.id)}
                    >
                        {option.label}
                    </button>
                )}
            </div>
        );
    }

    render() {
        const network = this.networkOf(this.getCurrentId());
        const { trail, hoveredId, stats, photos, view } = this.state;
        const hovered = network.teammates.find(teammate => teammate.id === hoveredId) || null;
        const photoOf = (id: string) => photos ? photos[id] ?? null : null;

        return (
            <div className="app">
                <Header
                    onSelectPlayer={this.handleNewSearch}
                    onRandomPlayer={this.handleRandomPlayer}
                />
                <main className="canvas column">
                    <PlayerSummary
                        network={network}
                        photo={photoOf(network.id)}
                        career={stats ? buildCareerLine(stats[network.id]) : null}
                        statsLoaded={stats !== null}
                    />
                    <HopPath
                        stops={trail.map(id => ({ id, name: playersObj[id].name.replace('*', ''), photo: photoOf(id) }))}
                        links={this.hopLinks()}
                        suggestions={trail.length === 1 ? network.teammates.slice(0, SUGGESTED_HOPS) : []}
                        photos={photos}
                        onSelectPlayer={this.handleHop}
                    />
                    {this.renderTabs()}
                    <div id="view-teammates" className="view span-6" role="tabpanel" aria-labelledby="tab-teammates" hidden={view !== 'teammates'}>
                        <NetworkGraph
                            network={network}
                            hoveredId={hoveredId}
                            onSelectPlayer={this.handleHop}
                            onHoverPlayer={this.handleHover}
                        />
                        <TeammateList
                            key={network.id}
                            teammates={network.teammates}
                            hoveredId={hoveredId}
                            onSelectPlayer={this.handleHop}
                            onHoverPlayer={this.handleHover}
                        />
                        <SeasonStrip
                            seasons={network.seasons}
                            playerName={network.name}
                            stats={stats ? stats[network.id] ?? null : null}
                            highlight={hovered}
                        />
                    </div>
                    <div id="view-era" className="view span-6" role="tabpanel" aria-labelledby="tab-era" hidden={view !== 'era'}>
                        <EraNetwork
                            player={{
                                id: network.id,
                                name: network.name,
                                careerStart: Number(network.player.career_start),
                                careerEnd: Number(network.player.career_end)
                            }}
                            minYear={CONSTANTS.FIRST_SEASON}
                            maxYear={CONSTANTS.LAST_SEASON}
                            photos={photos}
                            onSelectPlayer={this.handleOpenFromEra}
                        />
                    </div>
                </main>
                <Footer playerCount={CONSTANTS.playerData.length} lastSeason={CONSTANTS.LAST_SEASON} />
            </div>
        );
    }
}

export default App;
