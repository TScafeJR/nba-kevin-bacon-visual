import React, { Component, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import '../style/Searchbar.css';

import { playerData } from '../data/constants';
import { formatYearSpan } from '../data/graph-methods/player-network-methods';
import { SearchChangeEvent } from '../types';

interface SearchEntry {
    id: string;
    name: string;
    lower: string;
    years: string;
    isHOFer: boolean;
}

const SEARCH_INDEX: SearchEntry[] = playerData
    .map(player => {
        const name = player.name.replace('*', '');
        return {
            id: player.bref_id,
            name,
            lower: name.toLowerCase(),
            years: formatYearSpan(Number(player.career_start), Number(player.career_end)),
            isHOFer: Boolean(player.isHOFer)
        };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

const MAX_SUGGESTIONS = 8;

// full-name prefix matches first, then a match on any later name ("malone" finds Karl and Moses)
const findSuggestions = (value: string): SearchEntry[] => {
    const query = value.trim().toLowerCase();
    if (!query) {
        return [];
    }
    const prefix = SEARCH_INDEX.filter(entry => entry.lower.startsWith(query));
    const word = SEARCH_INDEX.filter(entry => !entry.lower.startsWith(query) &&
        entry.lower.split(/[\s-]+/).some(part => part.startsWith(query)));
    return [...prefix, ...word].slice(0, MAX_SUGGESTIONS);
};

interface SearchbarProps {
    onSelectPlayer: (playerId: string) => void;
}

interface SearchbarState {
    suggestions: SearchEntry[];
    text: string;
    activeIndex: number;
    focused: boolean;
}

class Searchbar extends Component<SearchbarProps, SearchbarState> {
    private inputRef: React.RefObject<HTMLInputElement | null>;

    constructor(props: SearchbarProps){
        super(props);
        this.inputRef = React.createRef();
        this.state = {
            suggestions: [],
            text: '',
            activeIndex: 0,
            focused: false
        };

        this.onTextChange = this.onTextChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onGlobalKeyDown = this.onGlobalKeyDown.bind(this);
        this.selectEntry = this.selectEntry.bind(this);
        this.close = this.close.bind(this);
        this.onFocus = this.onFocus.bind(this);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onGlobalKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onGlobalKeyDown);
    }

    // "/" jumps to the search from anywhere outside a field
    onGlobalKeyDown(e: globalThis.KeyboardEvent){
        const target = e.target as HTMLElement;
        if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
            e.preventDefault();
            this.inputRef.current?.focus();
        }
    }

    onTextChange(e: SearchChangeEvent){
        const { value } = e.target;
        this.setState(() => ({
            suggestions: findSuggestions(value),
            text: value,
            activeIndex: 0
        }));
    }

    onKeyDown(e: KeyboardEvent<HTMLInputElement>){
        const { suggestions, activeIndex } = this.state;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            const count = Math.max(suggestions.length, 1);
            this.setState(() => ({
                activeIndex: (activeIndex + step + count) % count
            }));
        } else if (e.key === 'Enter' && suggestions[activeIndex]) {
            e.preventDefault();
            this.selectEntry(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            this.close();
            this.inputRef.current?.blur();
        }
    }

    selectEntry(entry: SearchEntry) {
        this.setState(() => ({
            text: '',
            suggestions: [],
            activeIndex: 0
        }));

        this.props.onSelectPlayer(entry.id);
        this.inputRef.current?.blur();
    }

    onFocus() {
        this.setState(({ text }) => ({
            focused: true,
            suggestions: findSuggestions(text),
            activeIndex: 0
        }));
    }

    close() {
        this.setState(() => ({ suggestions: [], focused: false }));
    }

    renderSuggestions() {
        const { suggestions, activeIndex, text, focused } = this.state;
        if (!focused) {
            return null;
        }
        if (text.trim() && suggestions.length === 0) {
            return <div className="search-empty">No player named “{text.trim()}” in the data.</div>;
        }
        if (suggestions.length === 0) {
            return null;
        }
        return (
            <ul className="search-suggestions" role="listbox" id="player-suggestions">
                {suggestions.map((entry, index) => 
                    <li
                        key={entry.id}
                        id={`suggestion-${entry.id}`}
                        role="option"
                        aria-selected={index === activeIndex}
                        className={index === activeIndex ? 'is-active' : undefined}
                        // mousedown, so the pick lands before the input's blur closes the list
                        onMouseDown={e => {
                            e.preventDefault();
                            this.selectEntry(entry);
                        }}
                        onMouseEnter={() => this.setState(() => ({ activeIndex: index }))}
                    >
                        <span className="suggestion-name">{entry.name}</span>
                        {entry.isHOFer && <span className="pill">HOF</span>}
                        <span className="suggestion-years num">{entry.years}</span>
                    </li>
                )}
            </ul>
        );
    }

    render() {
        const { suggestions, activeIndex } = this.state;
        const open = suggestions.length > 0;
        return (
            <div className="search">
                <Search className="search-icon" size={15} strokeWidth={1.75} aria-hidden="true" />
                <input
                    ref={this.inputRef}
                    className="search-input"
                    type="search"
                    placeholder={`Search ${SEARCH_INDEX.length.toLocaleString('en')} players`}
                    aria-label="Search players"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls="player-suggestions"
                    aria-activedescendant={open ? `suggestion-${suggestions[activeIndex].id}` : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={this.onTextChange}
                    onKeyDown={this.onKeyDown}
                    onBlur={this.close}
                    onFocus={this.onFocus}
                    value={this.state.text}
                />
                <kbd className="search-key" aria-hidden="true">/</kbd>
                {this.renderSuggestions()}
            </div>
        );
    }
}

export default Searchbar;
