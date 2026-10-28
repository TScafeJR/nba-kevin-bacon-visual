import React, { Component } from 'react';
import PlayerAvatar from './PlayerAvatar';
import { PlayerPhoto, TeammateLink } from '../../types';
import '../../style/HopPath.css';

export interface HopStop {
    id: string;
    name: string;
    photo: PlayerPhoto | null;
}

// what joins two neighbouring stops: the teams and seasons they shared
export interface HopLink {
    franchises: string[];
    yearSpan: string;
    seasonsTogether: number;
}

interface HopPathProps {
    // where the path began first, the player on screen last
    stops: HopStop[];
    // links[i] joins stops[i] and stops[i + 1]; null when the two were never teammates
    links: Array<HopLink | null>;
    // first hops to offer while the path is a single stop
    suggestions: TeammateLink[];
    photos: Record<string, PlayerPhoto> | null;
    onSelectPlayer: (playerId: string) => void;
}

const plural = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

// The game itself: every hop from where the path began, each link naming the team and seasons
// that connect the two players. A stop before the last one goes back to it.
class HopPath extends Component<HopPathProps> {
    renderLink(link: HopLink | null, index: number) {
        if (!link) {
            return <li key={`link-${index}`} className="hop-link" aria-hidden="true"><span className="hop-team">→</span></li>;
        }
        return (
            <li key={`link-${index}`} className="hop-link" aria-label={`teammates on ${link.franchises.join(' and ')}, ${link.yearSpan}`}>
                <span className="hop-team">{link.franchises.join(' · ')}</span>
                <span className="hop-years num">{link.yearSpan}</span>
            </li>
        );
    }

    renderStop(stop: HopStop, index: number) {
        const { stops, onSelectPlayer } = this.props;
        const current = index === stops.length - 1;
        const face = <PlayerAvatar name={stop.name} photo={stop.photo} className="hop-photo" />;
        return (
            <li key={stop.id} className="hop">
                {current
                    ? <span className="hop-stop is-current" aria-current="page">{face}<span className="hop-name">{stop.name}</span></span>
                    :
                    <button type="button" className="hop-stop" onClick={() => onSelectPlayer(stop.id)}>
                        {face}<span className="hop-name">{stop.name}</span>
                    </button>
                }
            </li>
        );
    }

    renderSuggestions() {
        const { suggestions, photos, onSelectPlayer } = this.props;
        if (suggestions.length === 0) {
            return null;
        }
        return (
            <li className="hop-next">
                <span className="hop-next-label">First hop</span>
                <ul className="hop-options">
                    {suggestions.map(teammate =>
                        <li key={teammate.id}>
                            <button type="button" className="hop-option" onClick={() => onSelectPlayer(teammate.id)}>
                                <PlayerAvatar name={teammate.name} photo={photos ? photos[teammate.id] ?? null : null} className="hop-photo" />
                                <span className="hop-option-text">
                                    <span className="hop-name">{teammate.name}</span>
                                    <span className="hop-years num">
                                        {plural(teammate.seasonsTogether, 'season')} · {teammate.franchises.join(', ')}
                                    </span>
                                </span>
                            </button>
                        </li>
                    )}
                </ul>
            </li>
        );
    }

    render() {
        const { stops, links } = this.props;
        const degrees = stops.length - 1;
        const [start] = stops;

        return (
            <section className="panel hops span-6" aria-labelledby="hops-title">
                <header className="hops-head">
                    <h2 id="hops-title">
                        {degrees === 0 ? `Hop from ${start.name}` : `${plural(degrees, 'degree')} from ${start.name}`}
                    </h2>
                    <p className="panel-sub">
                        {degrees === 0
                            ? 'Pick any teammate to start a path.'
                            : 'Each link is the team and seasons they shared.'}
                    </p>
                </header>
                <ol className="hops-path">
                    {stops.flatMap((stop, index) => index === 0
                        ? [this.renderStop(stop, index)]
                        : [this.renderLink(links[index - 1], index - 1), this.renderStop(stop, index)])}
                    {degrees === 0 && this.renderSuggestions()}
                </ol>
            </section>
        );
    }
}

export default HopPath;
