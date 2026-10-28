import React, { Component, Fragment } from 'react';
import { ArrowUpRight } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { formatYearSpan } from '../../data/graph-methods/player-network-methods';
import { formatPct, formatPerGame } from '../../data/graph-methods/player-stats-methods';
import { PlayerNetwork, PlayerPhoto, StatLine } from '../../types';
import '../../style/PlayerSummary.css';

interface PlayerSummaryProps {
    network: PlayerNetwork;
    photo: PlayerPhoto | null;
    // null while the box scores load, and for a player without any
    career: StatLine | null;
    // false until the box scores have arrived, so the career tile can hold its place
    statsLoaded: boolean;
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

// The header card is the player, and the three tiles under it answer the next questions: how many
// teammates (the screen's answer, so it leads), over how long, and how good a player.
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

    renderCareer() {
        const { career, statsLoaded } = this.props;
        if (!statsLoaded) {
            return (
                <Fragment>
                    <dd className="kpi-value"><span className="kpi-loading" aria-label="Loading career numbers" /></dd>
                    <dd className="kpi-sub"><span className="kpi-loading is-small" /></dd>
                </Fragment>
            );
        }
        if (!career) {
            return <dd className="kpi-sub">No box scores on record.</dd>;
        }
        const figures = [
            { unit: 'ppg', value: formatPerGame(career.points) },
            { unit: 'rpg', value: formatPerGame(career.rebounds) },
            { unit: 'apg', value: formatPerGame(career.assists) }
        ];
        return (
            <Fragment>
                <dd className="kpi-value kpi-line num">
                    {figures.map(figure =>
                        <span key={figure.unit}>{figure.value}<span className="kpi-unit">{figure.unit}</span></span>
                    )}
                </dd>
                <dd className="kpi-sub num">
                    {career.games.toLocaleString('en')} game{career.games === 1 ? '' : 's'} · {formatPct(career.fieldGoalPct)} from the field
                </dd>
            </Fragment>
        );
    }

    render() {
        const { network, photo } = this.props;
        const { player } = network;
        const hofTeammates = network.hofTeammateCount;

        return (
            <Fragment>
                <section className="panel summary span-6" aria-labelledby="player-name">
                    <PlayerAvatar name={network.name} photo={photo} className="summary-photo" />
                    <div className="summary-details">
                        <div className="summary-title">
                            <h1 id="player-name">{network.name}</h1>
                            {network.isHOFer && <span className="pill">Hall of Fame</span>}
                        </div>
                        <p className="summary-meta">{this.renderMeta()}</p>
                        <p className="summary-finding">{describeFinding(network)}</p>
                        {this.renderCredit()}
                    </div>
                    <a
                        className="button button-outline summary-link"
                        href={`https://www.basketball-reference.com/players/${player.bref_letter}/${player.bref_id}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Basketball-Reference
                        <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                </section>

                <dl className="panel kpi is-lead span-2">
                    <dt>Teammates</dt>
                    <dd className="kpi-value num">{network.teammates.length.toLocaleString('en')}</dd>
                    <dd className="kpi-sub">
                        {hofTeammates === 0 ? 'None in the Hall of Fame' : `${plural(hofTeammates, 'Hall of Famer')} among them`}
                    </dd>
                </dl>
                <dl className="panel kpi span-2">
                    <dt>Seasons</dt>
                    <dd className="kpi-value num">{network.seasonCount}</dd>
                    <dd className="kpi-sub">
                        {network.franchises.length === 1 ? 'All with ' : `${network.franchises.length} franchises: `}
                        {network.franchises.join(', ')}
                    </dd>
                </dl>
                <dl className="panel kpi kpi-career span-2">
                    <dt>Career, per game</dt>
                    {this.renderCareer()}
                </dl>
            </Fragment>
        );
    }
}

export default PlayerSummary;
