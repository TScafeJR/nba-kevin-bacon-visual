import React, { Component } from 'react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { formatYearSpan } from '../../data/graph-methods/player-network-methods';
import { formatPct, formatPerGame } from '../../data/graph-methods/player-stats-methods';
import { PlayerNetwork, PlayerPhoto, StatLine } from '../../types';
import '../../style/PlayerSummary.css';

interface TrailStop {
    id: string;
    name: string;
}

interface PlayerSummaryProps {
    network: PlayerNetwork;
    trail: TrailStop[];
    photo: PlayerPhoto | null;
    career: StatLine | null;
    onSelectPlayer: (playerId: string) => void;
}

const plural = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

const describeFinding = (network: PlayerNetwork): string => {
    const [longest] = network.teammates;
    if (!longest) {
        return 'No teammates on record in this data.';
    }
    if (longest.seasonsTogether === 1) {
        return 'Never shared more than one season with the same teammate.';
    }
    const most = longest.seasonsTogether;
    const tied = network.teammates.filter(teammate => teammate.seasonsTogether === most);
    const names = tied.length > 2 ? `${tied[0].name}, ${tied[1].name} and ${tied.length - 2} more` : tied.map(t => t.name).join(' and ');
    return `Longest partnership: ${names}, ${longest.seasonsTogether} seasons together.`;
};

class PlayerSummary extends Component<PlayerSummaryProps> {
    renderMeta() {
        const { player } = this.props.network;
        const body = [player.height, player.weight && `${player.weight} lb`].filter(Boolean).join(', ');
        const parts = [
            player.position,
            body,
            player.birth_date && `Born ${player.birth_date}`,
            player.colleges,
            formatYearSpan(Number(player.career_start), Number(player.career_end))
        ].filter(Boolean);
        return parts.join(' · ');
    }

    renderCareer() {
        const { career } = this.props;
        if (!career) {
            return null;
        }
        const figures = [
            { label: 'Games', value: career.games.toLocaleString('en') },
            { label: 'PPG', value: formatPerGame(career.points) },
            { label: 'RPG', value: formatPerGame(career.rebounds) },
            { label: 'APG', value: formatPerGame(career.assists) },
            { label: 'FG%', value: formatPct(career.fieldGoalPct) }
        ];
        return (
            <dl className="summary-career" title="Career, per game">
                {figures.map(figure =>
                    <div key={figure.label}>
                        <dt>{figure.label}</dt>
                        <dd className="num">{figure.value}</dd>
                    </div>
                )}
            </dl>
        );
    }

    renderCredit() {
        const { photo } = this.props;
        if (!photo) {
            return null;
        }
        const credit = [photo.author, photo.license].filter(Boolean).join(', ');
        return (
            <p className="summary-credit">
                Photo: <a href={photo.page} target="_blank" rel="noopener noreferrer" title={credit}>{credit || 'Wikimedia Commons'}</a>
            </p>
        );
    }

    renderTrail() {
        const { trail, onSelectPlayer } = this.props;
        const degrees = trail.length - 1;
        return (
            <nav className="trail" aria-label="Path between players">
                <ol>
                    {trail.map((stop, index) => {
                        const current = index === trail.length - 1;
                        return (
                            <li key={stop.id}>
                                {index > 0 && <ChevronRight className="trail-sep" size={14} strokeWidth={1.75} aria-hidden="true" />}
                                {current
                                    ? <span className="trail-stop is-current" aria-current="page">{stop.name}</span>
                                    : <button type="button" className="trail-stop" onClick={() => onSelectPlayer(stop.id)}>{stop.name}</button>}
                            </li>
                        );
                    })}
                </ol>
                <span className="trail-count">
                    {degrees === 0
                        ? 'Click a teammate to hop to their network'
                        : `${plural(degrees, 'degree')} from ${trail[0].name}`}
                </span>
            </nav>
        );
    }

    render() {
        const { network } = this.props;
        const { player } = network;
        const figures = [
            { label: 'Teammates', value: network.teammates.length, lead: true },
            { label: 'Seasons', value: network.seasonCount },
            { label: 'Franchises', value: network.franchises.length },
            { label: 'Hall of Fame teammates', value: network.hofTeammateCount }
        ];

        return (
            <section className="panel summary" aria-labelledby="player-name">
                <div className="summary-identity">
                    <PlayerAvatar name={network.name} photo={this.props.photo} className="summary-photo" />
                    <div className="summary-details">
                        <div className="summary-title">
                            <h1 id="player-name">{network.name}</h1>
                            {network.isHOFer && <span className="pill">Hall of Fame</span>}
                        </div>
                        <p className="summary-meta">
                            {this.renderMeta()}
                            <a
                                className="summary-link"
                                href={`https://www.basketball-reference.com/players/${player.bref_letter}/${player.bref_id}.html`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Basketball-Reference<ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                            </a>
                        </p>
                        {this.renderCareer()}
                        <p className="summary-finding">{describeFinding(network)}</p>
                        {this.renderCredit()}
                    </div>
                </div>
                <dl className="summary-figures">
                    {figures.map(figure => 
                        <div key={figure.label} className={figure.lead ? 'figure is-lead' : 'figure'}>
                            <dt>{figure.label}</dt>
                            <dd className="num">{figure.value.toLocaleString('en')}</dd>
                        </div>
                    )}
                </dl>
                {this.renderTrail()}
            </section>
        );
    }
}

export default PlayerSummary;
