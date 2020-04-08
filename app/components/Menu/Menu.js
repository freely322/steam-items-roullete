import React, { PureComponent} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad, faInfoCircle, faHistory, faStar, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
import { bindActionCreators } from 'redux';
import style from './style.scss';
import {set_tab, toggle_sound} from "../../actions/gameActions";
import config from '../../../config';
import {connect} from "react-redux";

class Menu extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="menu">
                <ul className="menu-items">
                    <li
                      style={{listStyle: 'none', cursor: 'pointer'}}
                      onClick={() => {this.props.updateTab("game")}}
                    >
                        <FontAwesomeIcon
                          icon={faGamepad}
                          className="menu-item"/>
                    </li>
                    <li
                      style={{listStyle: 'none', cursor: 'pointer'}}
                      onClick={() => {this.props.updateTab("faq")}}
                    >
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="menu-item"/>
                    </li>
                    <li
                      style={{listStyle: 'none', cursor: 'pointer'}}
                      onClick={() => {this.props.updateTab("history")}}
                    >
                        <FontAwesomeIcon
                          icon={faHistory}
                          className="menu-item"/>
                    </li>
                    <li
                      style={{listStyle: 'none', cursor: 'pointer'}}
                      onClick={() => {this.props.updateTab("records")}}
                    >
                        <FontAwesomeIcon
                          icon={faStar}
                          className="menu-item"/>
                    </li>
                    {
                        this.props.user &&
                        config.admins.includes(this.props.user.steamid) &&
                            <li
                              style={{listStyle: 'none', cursor: 'pointer'}}
                              onClick={() => {this.props.updateTab("admin")}}
                            >
                                <FontAwesomeIcon
                                  icon={faStar}
                                  className="menu-item"/>
                            </li>
                    }
                </ul>
                <ul className="menu-items sound">
                    <li
                      style={{listStyle: 'none', cursor: 'pointer'}}
                      onClick={() => {this.props.toggleSound()}}>
                        <FontAwesomeIcon
                          icon={this.props.sound ? faVolumeUp : faVolumeMute}
                          className="menu-item"/>
                    </li>
                </ul>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        tab: state.app.tab,
        user: state.app.user,
        sound: state.app.sound
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        updateTab: set_tab,
        toggleSound: toggle_sound,
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);