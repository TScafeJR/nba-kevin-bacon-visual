import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import '../../style/Footer.css'

class Footer extends Component {
    render() {
        return (
            <div className="d-flex flex-column">
                <footer className="footer rounded-lg border">
                    {/*<div className="footer-div">*/}
                    {/*    <a href="https://dukeswines.com">Dukes Wine </a> <span>&copy; 2020 Dukes Wine.</span>*/}
                    {/*</div>*/}
                    <div className="ml-auto footer-div">
                        <span>Powered by </span><a href="https://github.com/TScafeJR">React and a few other libraries</a>
                    </div>
                    <br/>
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
