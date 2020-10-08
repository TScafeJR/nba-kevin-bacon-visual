import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import Searchbar from '../Searchbar';

class Header extends Component {
    render() {
        return (
            <div className="Header">
                <h1>NBA Kevin Bacon App</h1>
                <Searchbar />
            </div>
        );
    }
}

export default hot(module)(Header);
