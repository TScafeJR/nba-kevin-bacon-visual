import React, { Component } from 'react';
import { ArrowRight } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { formatShare } from '../../data/graph-methods/player-stats-methods';
import { CentralityNode, PlayerPhoto } from '../../types';
import '../../style/PlayerProfileCard.css';

interface PlayerProfileCardProps {
    node: CentralityNode;
    // everyone scored in the era, for "#3 of 1,204"
    nodeCount: number;
    // "1986–2003", or "BOS, 1986–2003"
    era: string;
    photo: PlayerPhoto | null;
    onOpenNetwork: (playerId: string) => void;
}

class PlayerProfileCard extends Component<PlayerProfileCardProps> {
    render() {
        const { node, nodeCount, era, photo, onOpenNetwork } = this.props;
        const [firstName] = node.name.split(' ');
        const total = nodeCount.toLocaleString('en');
        const headingId = `profile-${node.id}`;

        return (
            <article className="profile-card" aria-labelledby={headingId}>
                <header className="profile-head">
                    <PlayerAvatar name={node.name} photo={photo} className="profile-photo" />
                    <div className="profile-identity">
                        <h3 id={headingId}>
                            <span className="profile-name">{node.name}</span>
                            {node.isHOFer && <span className="pill">HOF</span>}
                        </h3>
                        <p className="profile-sub">
                            {node.seasons} season{node.seasons === 1 ? '' : 's'} in {era}
                        </p>
                    </div>
                </header>

                <dl className="profile-figures">
                    <div className="profile-figure">
                        <dt>Bridging <span className="profile-term">betweenness</span></dt>
                        <dd className="profile-reading">
                            <span className="profile-value num">{formatShare(node.betweenness)}</span>
                            <span className="profile-rank num">#{node.betweennessRank.toLocaleString('en')} of {total}</span>
                        </dd>
                        <dd className="profile-note">
                            of the shortest teammate paths between other players run through {firstName}.
                        </dd>
                    </div>
                    <div className="profile-figure">
                        <dt>Teammates <span className="profile-term">degree</span></dt>
                        <dd className="profile-reading">
                            <span className="profile-value num">{node.degree.toLocaleString('en')}</span>
                            <span className="profile-rank num">#{node.degreeRank.toLocaleString('en')} of {total}</span>
                        </dd>
                        <dd className="profile-note">
                            {formatShare(node.degreeCentrality)} of everyone who played in {era}.
                        </dd>
                    </div>
                </dl>

                <button type="button" className="button button-outline profile-open" onClick={() => onOpenNetwork(node.id)}>
                    Open {firstName}’s network
                    <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
                </button>
            </article>
        );
    }
}

export default PlayerProfileCard;
