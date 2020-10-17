import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import '../style/Searchbar.css';
import { playerData } from '../data/constants';
import ListGroup from 'react-bootstrap/ListGroup';

const PLAYER_NAMES = playerData.map(player => player.name.replace('*', ''));

class Searchbar extends Component {
    constructor(props){
        super(props)
        this.state = {
            suggestions: [],
            text: ''
        }

        this.onTextChange = this.onTextChange.bind(this);
        this.selectedText = this.selectedText.bind(this);
        this.renderSuggestions = this.renderSuggestions.bind(this);
    }

    onTextChange(e){
        const value = e.target.value;
        let suggestions = [];
        if(value.length > 0){
            const regex = new RegExp(`^${value}`, 'i');
            suggestions = PLAYER_NAMES.sort().filter(v => regex.test(v))
        }

        this.setState(() => ({
            suggestions,
            text: value
        }))

        console.log(this.state)
    }

    selectedText(value) {
        this.setState(() => ({
            text: value,
            suggestions: [],
        }))
    }

    renderSuggestions() {
        let { suggestions } = this.state;
        if(suggestions.length === 0){
            return null;
        }
        return (
            <ListGroup>
                {suggestions.map((item, index) => (<ListGroup.Item key={index} onClick={() => this.selectedText(item)}>{item}</ListGroup.Item>))}
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
                        title="Search Type"
                        id="input-group-dropdown-2"
                    >
                        <Dropdown.Item href="#">Action</Dropdown.Item>
                        <Dropdown.Item href="#">Another action</Dropdown.Item>
                        <Dropdown.Item href="#">Something else here</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item href="#">Separated link</Dropdown.Item>
                    </DropdownButton>
                </InputGroup>
                {this.renderSuggestions()}
            </div>
        );
    }
}

export default hot(module)(Searchbar);
