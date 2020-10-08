import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

class Header extends Component {
    render() {
        return (
            <div className="Header">
                <h1>Header</h1>
            </div>
        );
    }
}

export default hot(module)(Header);
