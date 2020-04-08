import React, { Component } from 'react';
import { Home } from './Home';
import style from './style.scss';
import Menu from "../components/Menu/Menu";

class IndexApp extends Component {

    componentWillMount() {
        document.title = "E4ZY.BET";
    }

    render() {
    return (
      <div className={'site'}>
        <Menu/>
        <Home/>
      </div>
    )
  }
}

export default IndexApp;
