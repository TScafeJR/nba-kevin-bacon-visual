import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Searchbar from '../Searchbar';
import NavigationBar from './NavigationBar';

class Header extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="Header">
                <NavigationBar />
                <Searchbar
                    startingInfo={this.props.startingInfo}
                    displayPlayer={this.props.displayPlayer}
                    handleSearchChange={this.props.handleSearchChange.bind(this)}
                />
            </div>
        );
    }
}

export default hot(module)(Header);
