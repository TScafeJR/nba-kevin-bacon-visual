import React, { Component } from 'react';
import { hot, setConfig } from 'react-hot-loader';
import Header from './static/Header';
import Footer from './static/Footer';
import NetworkGraph from './NetworkGraph';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/App.css';
const CONSTANTS = require('../data/constants');


setConfig({
    showReactDomPatchNotification: false
});

class App extends Component {
    render() {
        return (
            <div className="app-container">
                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
                    integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
                    crossOrigin="anonymous"
                />
                <link rel="stylesheet" href="https://unpkg.com/@coreui/coreui/dist/css/coreui.min.css"/>
                <Header />
                <NetworkGraph
                    startingEdges={CONSTANTS.EDGES}
                    startingNodes={CONSTANTS.NODES}
                />
                <Footer />
            </div>
        );
    }
}

export default hot(module)(App);
