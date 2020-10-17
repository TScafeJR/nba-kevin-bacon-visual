import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Searchbar from '../Searchbar';
import NavigationBar from './NavigationBar';

class Header extends Component {
    render() {
        return (
            <div className="Header">
                <NavigationBar />
                <Searchbar />
            </div>
        );
    }
}

export default hot(module)(Header);
