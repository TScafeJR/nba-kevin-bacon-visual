import React, { Component } from 'react';
import { buildStatLine, formatPct, formatPerGame } from '../../data/graph-methods/player-stats-methods';
import { SeasonEntry, StintTotals, TeammateLink } from '../../types';
import '../../style/SeasonStrip.css';

interface SeasonStripProps {
    seasons: SeasonEntry[];
    playerName: string;
    highlight: TeammateLink | null;
    // box score totals by team key, once they have loaded
    stats: Record<string, StintTotals> | null;
}

interface SeasonStripState {
    hoveredKey: string | null;
}

// round steps of 1, 2, 5 × 10^n whose top sits above the largest value
const niceTicks = (max: number, count = 4): number[] => {
    const raw = Math.max(max, 1) / count;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].map(m => m * magnitude).find(s => s >= raw) || 10 * magnitude;
    let top = Math.ceil(max / step) * step;
    if (top <= max) {
        top += step;
    }
    const ticks = [];
    for (let value = 0; value <= top; value += step) {
        ticks.push(value);
    }
    return ticks;
};

class SeasonStrip extends Component<SeasonStripProps, SeasonStripState> {
    constructor(props: SeasonStripProps) {
        super(props);
        this.state = { hoveredKey: null };
    }

    renderSeasonStats(entry: SeasonEntry) {
        const stint = this.props.stats?.[entry.key];
        const label = `${entry.season} ${entry.franchise}`;
        if (!stint) {
            return <p className="panel-sub strip-note is-highlight">{label}</p>;
        }
        const line = buildStatLine([stint]);
        return (
            <p className="panel-sub strip-note is-highlight">
                {label}: <span className="num">{line.games}</span> games,
                {' '}<span className="num">{formatPerGame(line.points)}</span> ppg,
                {' '}<span className="num">{formatPerGame(line.rebounds)}</span> rpg,
                {' '}<span className="num">{formatPerGame(line.assists)}</span> apg,
                {' '}<span className="num">{formatPct(line.fieldGoalPct)}</span> FG
            </p>
        );
    }

    renderNote() {
        const { seasons, highlight } = this.props;
        const hovered = seasons.find(entry => entry.key === this.state.hoveredKey);
        if (hovered) {
            return this.renderSeasonStats(hovered);
        }
        if (highlight) {
            return (
                <p className="panel-sub strip-note is-highlight">
                    <span className="swatch swatch-long" />
                    {highlight.seasonsTogether} season{highlight.seasonsTogether === 1 ? '' : 's'} with {highlight.name}
                </p>
            );
        }
        if (seasons.length === 0) {
            return null;
        }
        const busiest = seasons.reduce((best, entry) => {
            return entry.teammateCount > best.teammateCount ? entry : best;
        });
        return (
            <p className="panel-sub strip-note">
                Most in {busiest.season} with {busiest.franchise}: <span className="num">{busiest.teammateCount}</span>
            </p>
        );
    }

    render() {
        const { seasons, playerName, highlight } = this.props;
        const ticks = niceTicks(Math.max(0, ...seasons.map(entry => entry.teammateCount)));
        const top = ticks[ticks.length - 1];
        const shared = new Set(highlight ? highlight.sharedTeamKeys : []);

        return (
            <section className="panel strip span-6" aria-labelledby="strip-title">
                <header className="panel-header">
                    <h2 id="strip-title">Teammates by season</h2>
                    {this.renderNote()}
                </header>
                {seasons.length === 0
                    ? <p className="empty-state">No seasons on record for {playerName}.</p>
                    : 
                        <div className="strip-plot" role="img" aria-label={`Teammates per season for ${playerName}, ${seasons.length} team seasons`}>
                            <div className="strip-grid" aria-hidden="true">
                                {ticks.slice().reverse().map(tick => 
                                    <div key={tick} className="strip-gridline">
                                        <span className="strip-tick num">{tick}</span>
                                    </div>
                                )}
                            </div>
                            <ol className="strip-cols" onMouseLeave={() => this.setState(() => ({ hoveredKey: null }))}>
                                {seasons.map((entry, index) => {
                                    const previous = seasons[index - 1];
                                    const changed = !previous
                                        || previous.franchise !== entry.franchise;
                                    const state = highlight ? shared.has(entry.key) ? ' is-shared' : ' is-dimmed' : '';
                                    return (
                                        <li
                                            key={entry.key}
                                            className={`strip-col${index % 2 ? ' is-odd' : ''}`}
                                            title={`${entry.season} ${entry.league} ${entry.franchise}: ${entry.teammateCount} teammates`}
                                            onMouseEnter={() => this.setState(() => ({ hoveredKey: entry.key }))}
                                        >
                                            <div className="strip-bar-area">
                                                <div className={`strip-bar${state}`} style={{ height: `${entry.teammateCount / top * 100}%` }} />
                                            </div>
                                            <span className="strip-year num">{entry.endYear}</span>
                                            <span className="strip-team">{changed ? entry.franchise : ''}</span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    }
            </section>
        );
    }
}

export default SeasonStrip;
