import React, { Component, ReactNode } from 'react';
import { Shuffle } from 'lucide-react';
import '../../../style/NavigationBar.css';

interface NavigationBarProps {
    onRandomPlayer: () => void;
    children?: ReactNode;
}

// the mark: a ball and its seams, in the leather orange the data uses
const Mark = () => 
    <svg className="mark" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="9.25" />
        <path d="M11 1.75v18.5M1.75 11h18.5M4.6 4.3c2.6 1.9 3.9 4.2 3.9 6.7s-1.3 4.8-3.9 6.7M17.4 4.3c-2.6 1.9-3.9 4.2-3.9 6.7s1.3 4.8 3.9 6.7" />
    </svg>
;

class NavigationBar extends Component<NavigationBarProps> {
    render() {
        return (
            <header className="topbar column">
                <div className="brand">
                    <Mark />
                    <span className="brand-name">NBA Kevin Bacon</span>
                </div>
                <div className="topbar-search">
                    {this.props.children}
                </div>
                <div className="topbar-actions">
                    <button type="button" className="button button-primary" onClick={this.props.onRandomPlayer} aria-label="Random Hall of Famer">
                        <Shuffle size={15} strokeWidth={1.75} aria-hidden="true" />
                        <span>Random Hall of Famer</span>
                    </button>
                </div>
            </header>
        );
    }
}

export default NavigationBar;
