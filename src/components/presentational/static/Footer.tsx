import React, { Component } from 'react';

import '../../../style/Footer.css';

interface FooterProps {
    playerCount: number;
    lastSeason: number;
}

class Footer extends Component<FooterProps> {
    render() {
        return (
            <footer className="footer column">
                <p>
                    {this.props.playerCount.toLocaleString('en')} players from the BAA, ABA and NBA, 1947 to {this.props.lastSeason}.
                    Player data from <a href="https://www.basketball-reference.com">Basketball-Reference</a>.
                </p>
                <p>
                    <a href="https://github.com/TScafeJR/nba-kevin-bacon-visual">Source on GitHub</a>
                </p>
            </footer>
        );
    }
}

export default Footer;
