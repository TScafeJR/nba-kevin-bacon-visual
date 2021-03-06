import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ListGroup from 'react-bootstrap/ListGroup';
import '../style/Searchbar.css';

import { playerData } from '../data/constants';

const PLAYER_NAMES = playerData.map(player => player.name.replace('*', ''));

class Searchbar extends Component {
    constructor(props){
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

    onTextChange(e){
        const { value } = e.target;
        let suggestions = [];
        if(value.length > 0){
            const regex = new RegExp(`^${value}`, 'i');
            suggestions = PLAYER_NAMES.sort().filter(v => regex.test(v));
        }

        this.setState(() => ({
            suggestions,
            text: value
        }));

        this.props.handleSearchChange(e);
    }


    handleSearchSelectionChange(e){
        // const { value } = e.target;
        console.log(e)
        //
        // this.setState(() => ({
        //     searchType: value
        // }));

        console.log(this.state);
    }

    selectedText(value) {
        this.setState(() => ({
            text: value,
            suggestions: []
        }));
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
