import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { set_user } from '../../actions/userActions'
import {set_game, set_winners, set_config} from '../../actions/gameActions'
import { get, post } from '../../fetch';
import _ from 'lodash';
import config from '../../../config';
import openSocket from 'socket.io-client';
import {MainBlock} from "../../components/MainBlock";
import {ProfileBlock} from "../../components/ProfileBlock";
import {HelperBlock} from "../../components/HelperBlock";
let background = require('../../images/background.jpg');
import appConfig from '../../../config';

const requestUrl = `${appConfig.host}`;
const requestPort = `${appConfig.port}`;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: false,
      inventory: [],
      chance: 0,
      helperTab: 'chat',
      selectedItems: [],
      timer: ``,
      chat: [],
      winner: null
    };
    this.socket = null;
    if (process.env.NODE_ENV === 'production') {
      this.socket = openSocket(`https://${config.host}`)
    } else {
      this.socket = openSocket(`https://${config.host}:${config.APIPort}`)
    }
    this.socket.on('betItemPoolUpdate', async (data) => {
      let game = await get('/game');
      this.props.updateGame(game)
    })
    this.socket.on('newChatMessage', async (data) => {
      this.setState({
        chat: [...this.state.chat, data]
      })
    });
    this.socket.on('newGame', data => {
      document.title = "New Game";
      this.getCurrentGame();
      this.getConfig();
      this.getWinners();
      setTimeout(() => {
        document.title = "E4ZY.BET";
      }, 5000)
    });
    this.socket.on('winner', data => {
      document.title = `${data.user.nickname} - WINNER`;
      this.setState({
        winner: data
      })
    });
    this.socket.on('timer', data => {
      this.setState({
        timer: data
      })
    });
    this.socket.on('error', data => {
      alert(data)
    });
    this.socket.on('info', data => {
      alert(data)
    });
    this.socket.on('deposit', data => {
      this.updateInventory();
      alert('items deposited')
    });
    this.socket.on('withdraw', data => {
      this.updateInventory();
      alert('items withdrawn')
    });
    this.socket.on('commission', data => {
      this.updateInventory();
      alert(data)
    })
  }

  componentDidMount() {
    console.log(process.env.NODE_ENV, ':', process.env.PORT);
    setInterval(() => {
      console.log('user: ', this.props.user);
      console.log('game: ', this.props.game);
      console.log('config: ', this.props.config);
      console.log('socket', this.socket);
    }, 15000);
    this.getCurrentGame();
    this.getConfig();
    this.getWinners();
  }

  betItems = () => {
    let selected = this.state.selectedItems;
    let total = 0;
    if (selected.length > 0) {
      selected.map(item => {
        total += item.price
      });
      let minimalBet = this.props.config.minBet;
      if (total >= minimalBet) {
        post('/bet', {id: this.props.user.steamid, items: selected}).then((res) => {
          let user = Object.assign({}, this.props.user);
          user.inventory = _.xorBy(this.props.user.inventory, selected, 'id');
          this.props.updateUser(user);
          this.socket.binary(false).emit('betItem', selected)
        });
        this.setState({
          yourBet: _.xorBy(this.state.yourBet, selected, 'id'),
          selectedItems: []
        })
      } else {
        alert(`Bet must be more than ${minimalBet}`)
      }
    } else {
      alert('select items')
    }
  };

  addItems = () => {
    let selected = this.state.selectedItems;
    if (selected.length > 0) {
      post('/user/addItems', {
        id: this.props.user.steamid,
        items: selected,
        socket: this.socket.id
      });
      this.setState({
        selectedItems: []
      })
    } else {
      alert('select any items')
    }
  };

  withdrawItems = () => {
    let selected = this.state.selectedItems;
    if (selected.length > 0) {
      let user = Object.assign({}, this.props.user);
      user.inventory = _.xorBy(user.inventory, selected, 'id');
      this.props.updateUser(user);
      post('/user/withdrawItems', {
        id: this.props.user.steamid,
        items: selected,
        socket: this.socket.id
      });
      this.setState({
        selectedItems: []
      })
    } else {
      alert('select items')
    }
  };

  getConfig = async () => {
    let config = await get('/config');
    this.props.updateConfig(config)
  };

  getCurrentGame = async () => {
    let game = await get('/game');
    this.props.updateGame(game);
    let res = await this.getInventory();
    if (res && res.user) {
      this.props.updateUser(res.user)
    }
    if (res) {
      this.setState({
        inventory: _.compact(res.inventory),
      })
    }
  };

  getWinners = async () => {
    let winners = await get('/games/winners');
    this.props.updateWinners(_.reverse(winners));
    console.log('winners', winners)
  };


  getInventory = async () => {
    return  await get('/inventory');
  };

  updateInventory = () => {
    this.getInventory().then((res) => {
      if (res) {
        console.log(res);
        this.props.updateUser(res.user);
        this.setState(
            {
              inventory: _.compact(res.inventory)
            }
        )
      }
    })
  };

  auth = () => {
    const { history } = this.props;
    if (process.env.NODE_ENV === 'production') {
      window.location = `https://${requestUrl}/authenticate`
    } else {
      window.location = `http://${requestUrl}:${+requestPort+1}/authenticate`
    }
  };

  logout = () => {
    get('/logout').then(() => {
      this.props.updateUser(null)
    })
  };

  setHelperTab = (tab) => {
    this.setState({
      helperTab: tab,
      selectedItems: []
    })
  };

  selectItem = (item, selecting) => {
    if (selecting !== this.state.selecting) {
      this.setState({
        selecting: selecting,
        selectedItems: [item]
      })
    } else {
      let temp = this.state.selectedItems;
      let updated = _.xorBy([item], temp, 'id');
      this.setState({
        selectedItems: updated
      })
    }
  }

  render() {
    return (
      <div className={'main'} style={{
        backgroundImage: `url('${background}')`
      }}>
        <MainBlock
            timer={this.state.timer}
            game={this.props.game}
            config={this.props.config}
            user={this.props.user}
            winners={this.props.winners}
            winner={this.state.winner}
            sound={this.props.sound}
            tab={this.props.tab}/>
        <div className={'block2-3Wrapper'}>
          <ProfileBlock
              auth={this.auth}
              logout={this.logout}
              user={this.props.user}
              setHelperTab={this.setHelperTab}
              updateUser={this.props.updateUser}
          />
          <HelperBlock
              tab={this.state.helperTab}
              selectItem={this.selectItem}
              socket={this.socket}
              chat={this.state.chat}
              selectedItems={this.state.selectedItems}
              setHelperTab={this.setHelperTab}
              betItems={this.betItems}
              game={this.props.game}
              user={this.props.user}
              inventory={this.state.inventory}
              addItems={this.addItems}
              withdrawItems={this.withdrawItems}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.app.user,
    winners: state.app.winners,
    config: state.app.config,
    game: state.app.game,
    tab: state.app.tab,
    sound: state.app.sound
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateUser: set_user,
    updateGame: set_game,
    updateConfig: set_config,
    updateWinners: set_winners
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
