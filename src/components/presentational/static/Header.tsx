import React, { Component } from 'react';
import Searchbar from '../../Searchbar';
import NavigationBar from './NavigationBar';

interface HeaderProps {
    onSelectPlayer: (playerId: string) => void;
    onRandomPlayer: () => void;
}

class Header extends Component<HeaderProps> {
    render() {
        return (
            <NavigationBar onRandomPlayer={this.props.onRandomPlayer}>
                <Searchbar onSelectPlayer={this.props.onSelectPlayer} />
            </NavigationBar>
        );
    }
}

export default Header;
