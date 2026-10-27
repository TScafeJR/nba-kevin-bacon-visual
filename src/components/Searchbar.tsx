import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ListGroup from 'react-bootstrap/ListGroup';
import '../style/Searchbar.css';

import { playerData } from '../data/constants';
import { SearchChangeEvent, StartingInfo } from '../types';

const PLAYER_NAMES = playerData.map(player => player.name.replace('*', '')).sort();

interface SearchbarProps {
    startingInfo: Pick<StartingInfo, 'centralPlayer'>;
    displayPlayer: string;
    handleSearchChange: (playerName: string) => void;
}

interface SearchbarState {
    suggestions: string[];
    text: string;
    searchType: string;
}

class Searchbar extends Component<SearchbarProps, SearchbarState> {
    constructor(props: SearchbarProps){
        super(props);
        this.state = {
            suggestions: [],
            text: this.props.startingInfo.centralPlayer.label,
            searchType: 'Search By Player'
        };

        this.onTextChange = this.onTextChange.bind(this);
        this.selectedText = this.selectedText.bind(this);
        this.renderSuggestions = this.renderSuggestions.bind(this);
        this.handleSearchSelectionChange = this.handleSearchSelectionChange.bind(this);
    }

    onTextChange(e: SearchChangeEvent){
        const { value } = e.target;
        let suggestions: string[] = [];
        if(value.length > 0){
            const query = value.toLowerCase();
            suggestions = PLAYER_NAMES.filter(v => v.toLowerCase().startsWith(query));
        }

        this.setState(() => ({
            suggestions,
            text: value
        }));

        this.props.handleSearchChange(value);
    }


    handleSearchSelectionChange(e: string | null){
        // const { value } = e.target;
        console.log(e)
        //
        // this.setState(() => ({
        //     searchType: value
        // }));

        console.log(this.state);
    }

    selectedText(value: string) {
        this.setState(() => ({
            text: value,
            suggestions: []
        }));

        this.props.handleSearchChange(value);
    }

    renderSuggestions() {
        const { suggestions } = this.state;
        if(suggestions.length === 0){
            return null;
        }
        return (
            <ListGroup className="auto-complete-list">
                {suggestions.map((item, index) => {
                    return <ListGroup.Item
                        key={index}
                        action
                        variant="light"
                        onClick={() => this.selectedText(item)}
                        onSelect={() => this.selectedText(item)}
                    >{item}</ListGroup.Item>;
                })}
            </ListGroup>
        );
    }


    render() {
        return (
            <div className="search-bar">
                <InputGroup>
                    <FormControl
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        onChange={this.onTextChange}
                        value={this.state.text}
                    />

                    <DropdownButton
                        as={InputGroup.Append}
                        variant="outline-secondary"
                        title={this.state.searchType}
                        id="input-group-dropdown-2 dropdown-search"
                        onSelect={this.handleSearchSelectionChange}
                    >
                        <Dropdown.Item href="#a">Search by Player</Dropdown.Item>
                        <Dropdown.Item href="#b">Network between Two Players</Dropdown.Item>
                        <Dropdown.Item href="#c">Search by Season Year</Dropdown.Item>
                    </DropdownButton>
                </InputGroup>
                {this.renderSuggestions()}
            </div>
        );
    }
}

export default hot(module)(Searchbar);
