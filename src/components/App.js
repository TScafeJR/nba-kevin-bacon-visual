import React, { Component } from 'react';
import { hot, setConfig } from 'react-hot-loader';
import Header from './static/Header';
import Footer from './static/Footer';
import NetworkGraph from './NetworkGraph';
import Searchbar from './Searchbar';

setConfig({
    showReactDomPatchNotification: false
});

class App extends Component {
    render() {
        return (
            <div className="app-container">
                <Header />
                <h1>NBA Kevin Bacon App</h1>
                <Searchbar />
                <NetworkGraph />
                {/*<link rel="shortcut icon" href={'/small_square.png'}/>*/}
                {/*<link rel="stylesheet" href="https://unpkg.com/@coreui/coreui/dist/css/coreui.min.css"/>*/}
                <Footer />
            </div>
        );
    }
}

export default hot(module)(App);
