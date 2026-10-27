import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Searchbar from '../../Searchbar';
import NavigationBar from './NavigationBar';
import { StartingInfo } from '../../../types';

interface HeaderProps {
    startingInfo: StartingInfo;
    displayPlayer: string;
    handleSearchChange: (playerName: string) => void;
}

class Header extends Component<HeaderProps> {
    constructor(props: HeaderProps){
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
