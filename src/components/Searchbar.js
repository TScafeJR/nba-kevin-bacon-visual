import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

class Searchbar extends Component {
    render() {
        return (
            <div className="search-bar">
                <h1>Searchbar</h1>
            </div>
        );
    }
}

export default hot(module)(Searchbar);
