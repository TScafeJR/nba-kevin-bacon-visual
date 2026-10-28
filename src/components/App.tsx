import React, { Component } from 'react';
import Header from './presentational/static/Header';
import Footer from './presentational/static/Footer';
import PlayerSummary from './presentational/PlayerSummary';
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

const playerIdFromHash = (): string | null => {
    const id = window.location.hash.startsWith(HASH_PREFIX) ? window.location.hash.slice(HASH_PREFIX.length) : '';
    return playersObj[id] ? id : null;
};

interface AppState {
    trail: string[];
    hoveredId: string | null;
    stats: StatsById | null;
    photos: PhotosById | null;
}

class App extends Component<object, AppState> {
    private networkCache: PlayerNetwork | null;

    constructor(props: object){
        super(props);
        this.networkCache = null;
        this.state = {
            trail: [playerIdFromHash() || CONSTANTS.STARTING_INFO.centralPlayer.id],
            hoveredId: null,
            stats: null,
            photos: null
        };

        this.handleHop = this.handleHop.bind(this);
        this.handleNewSearch = this.handleNewSearch.bind(this);
        this.handleRandomPlayer = this.handleRandomPlayer.bind(this);
        this.handleHover = this.handleHover.bind(this);
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

    getNetwork(): PlayerNetwork {
        const id = this.getCurrentId();
        if (!this.networkCache || this.networkCache.id !== id) {
            this.networkCache = buildPlayerNetwork(id);
        }
        return this.networkCache;
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

    render() {
        const network = this.getNetwork();
        const { hoveredId, stats, photos } = this.state;
        const hovered = network.teammates.find(teammate => teammate.id === hoveredId) || null;

        return (
            <div className="app">
                <Header
                    onSelectPlayer={this.handleNewSearch}
                    onRandomPlayer={this.handleRandomPlayer}
                />
                <main className="canvas">
                    <PlayerSummary
                        network={network}
                        trail={this.state.trail.map(id => ({ id, name: playersObj[id].name.replace('*', '') }))}
                        photo={photos ? photos[network.id] ?? null : null}
                        career={stats ? buildCareerLine(stats[network.id]) : null}
                        onSelectPlayer={this.handleHop}
                    />
                    <div className="explorer">
                        <NetworkGraph
                            network={network}
                            hoveredId={this.state.hoveredId}
                            onSelectPlayer={this.handleHop}
                            onHoverPlayer={this.handleHover}
                        />
                        <TeammateList
                            key={network.id}
                            teammates={network.teammates}
                            hoveredId={this.state.hoveredId}
                            onSelectPlayer={this.handleHop}
                            onHoverPlayer={this.handleHover}
                        />
                    </div>
                    <SeasonStrip
                        seasons={network.seasons}
                        playerName={network.name}
                        stats={stats ? stats[network.id] ?? null : null}
                        highlight={hovered}
                    />
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
                        onSelectPlayer={this.handleNewSearch}
                    />
                </main>
                <Footer playerCount={CONSTANTS.playerData.length} lastSeason={CONSTANTS.LAST_SEASON} />
            </div>
        );
    }
}

export default App;
