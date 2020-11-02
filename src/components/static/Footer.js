import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import FontAwesome from 'react-fontawesome';

import '../../style/Footer.css';

class Footer extends Component {
    render() {
        return (
            <div className="d-flex flex-column">
                <footer className="footer rounded-lg border">
                    <div className="ml-auto footer-div">
                        <span>Powered by </span><a href="https://github.com/TScafeJR">React and a few other libraries</a>
                    </div>
                    <div className="centered">
                        <p>
                            <a href='https://github.com' className='social-link'><FontAwesome name='github' size="2x"/></a>
                            &nbsp;&nbsp;&nbsp;
                            <a href='https://reddit.com' className='social-link'><FontAwesome name='reddit' size="2x"/></a>
                        </p>
                    </div>
                    <div>
                        <img
                            className="centered"
                            src={'https://seeklogo.com/images/N/nba-logo-41668C66DB-seeklogo.com.png'}
                            alt={'This is the NBA Logo'}
                        />
                    </div>
                </footer>
            </div>
        );
    }
}

export default hot(module)(Footer);
