import React, { Component } from 'react';
import { hot, setConfig } from 'react-hot-loader';
import Header from './static/Header';
import Footer from './static/Footer';
import NetworkGraph from './NetworkGraph';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/App.css';
const CONSTANTS = require('../data/constants');
import 'font-awesome/css/font-awesome.min.css';


setConfig({
    showReactDomPatchNotification: false
});

class App extends Component {
    render() {
        return (
            <div className="app-container">
                <link rel="shortcut icon" href={'/app-icon.png'}/>
                <link
                    rel="stylesheet"
                    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
                    integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
                    crossOrigin="anonymous"
                />
                <link rel="stylesheet" href="https://unpkg.com/@coreui/coreui/dist/css/coreui.min.css"/>
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
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
