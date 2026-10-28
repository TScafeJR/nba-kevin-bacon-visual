import React, { Component } from 'react';
import { LONG_PARTNERSHIP_SEASONS } from '../../data/constants';
import { SearchChangeEvent, TeammateLink } from '../../types';
import '../../style/TeammateList.css';

interface TeammateListProps {
    teammates: TeammateLink[];
    hoveredId: string | null;
    onSelectPlayer: (playerId: string) => void;
    onHoverPlayer: (playerId: string | null) => void;
}

interface TeammateListState {
    filter: string;
}

class TeammateList extends Component<TeammateListProps, TeammateListState> {
    constructor(props: TeammateListProps) {
        super(props);
        this.state = { filter: '' };
        this.onFilterChange = this.onFilterChange.bind(this);
    }

    onFilterChange(e: SearchChangeEvent) {
        const { value } = e.target;
        this.setState(() => ({ filter: value }));
    }

    render() {
        const { teammates, hoveredId, onSelectPlayer, onHoverPlayer } = this.props;
        const query = this.state.filter.trim().toLowerCase();
        const shown = query
            ? teammates.filter(teammate => teammate.name.toLowerCase().includes(query))
            : teammates;
        const maxSeasons = Math.max(1, ...teammates.map(teammate => teammate.seasonsTogether));

        return (
            <section className="panel teammates explorer-cell span-2" aria-labelledby="teammates-title">
                <header className="panel-header">
                    <h2 id="teammates-title">Teammates</h2>
                    <span className="panel-count num">
                        {query ? `${shown.length} of ${teammates.length}` : teammates.length}
                    </span>
                </header>
                <div className="teammates-filter">
                    <input
                        type="search"
                        className="field"
                        placeholder="Filter by name"
                        aria-label="Filter teammates by name"
                        value={this.state.filter}
                        onChange={this.onFilterChange}
                    />
                </div>
                <div className="teammates-head" aria-hidden="true">
                    <span>Player</span>
                    <span>Seasons together</span>
                </div>
                <ul className="teammates-list" onMouseLeave={() => onHoverPlayer(null)}>
                    {shown.map(teammate => {
                        const long = teammate.seasonsTogether >= LONG_PARTNERSHIP_SEASONS;
                        return (
                            <li key={teammate.id}>
                                <button
                                    type="button"
                                    className={teammate.id === hoveredId ? 'teammate is-hovered' : 'teammate'}
                                    onClick={() => onSelectPlayer(teammate.id)}
                                    onMouseEnter={() => onHoverPlayer(teammate.id)}
                                    onFocus={() => onHoverPlayer(teammate.id)}
                                    aria-label={`${teammate.name}, ${teammate.seasonsTogether} seasons together. Hop to their network.`}
                                >
                                    <span className="teammate-name">
                                        <span className="teammate-label">{teammate.name}</span>
                                        {teammate.isHOFer && <span className="pill">HOF</span>}
                                    </span>
                                    <span className="teammate-seasons num">{teammate.seasonsTogether}</span>
                                    <span className="teammate-sub">{teammate.franchises.join(', ')} · {teammate.yearSpan}</span>
                                    <span className="teammate-bar" aria-hidden="true">
                                        <span
                                            className={long ? 'is-long' : undefined}
                                            style={{ width: `${teammate.seasonsTogether / maxSeasons * 100}%` }}
                                        />
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                    {shown.length === 0 && 
                        <li className="empty-state">
                            {teammates.length === 0 ? 'No teammates on record.' : `No teammate matches “${this.state.filter.trim()}”.`}
                        </li>
                    }
                </ul>
            </section>
        );
    }
}

export default TeammateList;
