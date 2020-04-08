import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSteam } from '@fortawesome/free-brands-svg-icons'
import { faSignOutAlt, faCog, faArrowCircleRight} from '@fortawesome/free-solid-svg-icons'
import { get, post, update, remove } from '../../fetch';
import _ from 'lodash'
import style from './style.scss';


class ProfileBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 0,
      height: 0,
      tab: 'profile',
      value: this.props.user ? this.props.user.tradeLink : ''
    }
    this.block = null;
  }

  componentDidMount() {
    this.checkSize()
    addEventListener('resize', this.checkSize)
  }

  componentWillUnmount() {
    removeEventListener('resize', this.checkSize)
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (!_.isEqual(nextState, this.state)) {
      return true
    }
    if (!_.isEqual(nextProps.user, this.props.user)) {
      this.setState({
        value: nextProps.user ? nextProps.user.tradeLink : ''
      })
      return true
    }
    return false
  }

  checkSize = () => {
    if (this.block) {
      let {width, height} = this.block.getBoundingClientRect()
      this.setState({
        width,
        height
      })
    }
  }

  goBack = () => {
    this.setState({
      tab: 'profile'
    })
  }

  goSettings = () => {
    this.setState({
      tab: 'settings'
    })
  }

  ///////// TRADE LINK ///////////

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    post('/user/updateTradeLink', {
      id: this.props.user.steamid,
      tradeLink: this.state.value
    }).then((res) => {
      if (res.status === 200) {
        let user = Object.assign({}, this.props.user)
        user.tradeLink = this.state.value
        this.props.updateUser(user)
      }
    })
    event.preventDefault();
  }

  ///////// TRADE LINK ///////////

  openInventory = () => {
    this.props.setHelperTab('inventory')
  }

  // (width - height - (height * 0.15)) * 0.80
  // height * 0.15
  render() {
    let smallButtonSize = {
      height: this.state.height * 0.25,
      width: this.state.height * 0.25,
    }
    let bigButtonSize = {
      height: this.state.height * 0.25,
      width: (this.state.width - this.state.height - (this.state.height * 0.50)) * 0.90
    }
    if (this.props.user) {
      return (<div className="main-block2" ref={(ref) => {this.block = ref; this.checkSize()}}>
        <div className="profile">
          <div className="profile__logged">
            {this.state.tab === 'settings' && <div className="profile__settings">
              <div className="profile_settings_input">
                <label htmlFor="tradelink">Tradelink: </label>
                <input value={this.state.value} onChange={this.handleChange} className="profile_tradelink" type="text" name="tradelink"/></div>
              <div className="profile_controls">
                <button style={bigButtonSize} onClick={this.handleSubmit} className="profile_controls_inventory settings_save">SAVE</button>
                <button style={smallButtonSize} onClick={this.goBack} className="profile_controls_settings settings_back">
                  <FontAwesomeIcon icon={faArrowCircleRight}/>
                </button>
              </div>
            </div>}
            {this.state.tab === 'profile' && <div className="profile_info">
              <div className="profile_stats">
                <div className="profile_stat">
                  <div>
                    <p className="profile_stat_name">Wins</p><span className="profile_stat_value">{this.props.user.wins}</span></div>
                </div>
                <div className="profile_stat">
                  <div>
                    <p className="profile_stat_name">Total Win</p><span className="profile_stat_value">{this.props.user.totalWin.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="profile_controls">
                <button style={bigButtonSize} onClick={this.openInventory} className="profile_controls_inventory">Inventory</button>
                <button onClick={this.goSettings} style={smallButtonSize} className="profile_controls_settings"><FontAwesomeIcon icon={faCog}/></button>
              </div>
            </div>}
            <div className="profile_avatar">
              <img src={this.props.user.avatar.large}/>
              <div className="profile_avatar_hover"><div onClick={this.props.logout}><FontAwesomeIcon icon={faSignOutAlt}/></div></div>
            </div>
          </div>
        </div>
      </div>)
    }
    return (
        <div className="main-block2">
          <div className="profile">
            <div className="profile__not-logged" onClick={this.props.auth}>
              <div className="profile__not-logged_image"><FontAwesomeIcon icon={faSteam} className={'profile__not-logged_steam'}/>
                <div className="profile__not-logged_image_text">
                  <p className="profile__not-logged_image_text_signin">Sign in</p>
                  <p className="profile__not-logged_image_text_through">through STEAM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default ProfileBlock;
