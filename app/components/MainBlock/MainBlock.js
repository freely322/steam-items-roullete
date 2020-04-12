import React, { Component } from 'react';
import style from './style.scss';
import InventoryItem from "../InventoryItem/InventoryItem";
import {post} from "../../fetch";
import _ from "lodash"
import {Scrollbars} from "react-custom-scrollbars";
import Chance from 'chance'
const overlay = require('../../images/wallpapersdota2.com-450.png');


class MainBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      winner: null,
      records: [],
      minBet: this.props.config ? this.props.config.minBet : '',
      gameDuration: this.props.config ? this.props.config.gameDuration : '',
      commission: this.props.config ? this.props.config.commission : '',
      nicknameBountyMultiplier: this.props.config ? this.props.config.nicknameBountyMultiplier : '',
      password: '',
      multicast: false,
      candidates: [],
      width: 0,
      choosing: false
    };
    this.player4x = null;
    this.player3x = null;
    this.player2x = null;
    this.block = null;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (
      (
        nextProps.tab === 'records' &&
        nextProps.winners &&
        this.props.winners.length !== nextProps.winners.length
      ) ||
      (
        this.state.records.length === 0 &&
        nextProps.winners.length > 0
      )
    ) {
      let records = [];
      let grouped = _.groupBy(nextProps.winners, (o) => o.user.nickname);
      _.forEach(grouped, (value, key) => {
        let total = 0;
        let prize = [];
        let games = 0;
        let user = value[0].user;
        value.map(bet => {
          prize = [...prize, ...bet.prize];
          games += 1;
        });
        prize = _.uniqBy(prize, 'id');
        prize.map(item => {
          total += item.price
        });
        records.push({
          total: +total.toFixed(2),
          prize: prize,
          games,
          user
        })
      });
      _.sortedIndexBy(records, 'total');
      this.setState({
        records: records
      })
    }
    if (this.props.config === null && nextProps.config !== null) {
      this.setState({
        minBet: nextProps.config.minBet,
        gameDuration: nextProps.config.gameDuration,
        commission: nextProps.config.commission,
        nicknameBountyMultiplier: nextProps.config.nicknameBountyMultiplier
      })
    }
    if (!_.isEqual(nextProps.winner, this.props.winner)) {
      let users = [];
      let weights = [];
      let candidates = [];
      let chance = new Chance();
      this.props.game.bets.map(bet => {
        users.push(bet.user);
        let total = 0;
        bet.items.map(item => {total += +item.price});
        weights.push(total)
      });
      for (let i = 1; i <= 100; i++) {
        if (i === 97) {
          candidates.push(nextProps.winner.user)
        } else {
          candidates.push(chance.weighted(users, weights))
        }
      }
      console.log('candidates', candidates);
      this.setState({
        winner: nextProps.winner,
        candidates: candidates
      }, this.newWinner)
    }
    return true
  }

  newWinner = () => {
    setTimeout(() => {
      this.setState({
        active: true,
      })
    }, 300);
    setTimeout(() => {
      this.setState({
        choosing: true,
      })
    }, 1500);
    setTimeout(() => {
      this.setState({
        multicast: true
      })
    }, 11000);
    setTimeout(() => {
        if (+this.state.winner.multiplier >= 3 && this.props.sound) {
          this.player4x.audio = 0.75;
          this.player4x.play()
        } else if (+this.state.winner.multiplier >= 2 && this.props.sound) {
          this.player3x.audio = 0.5;
          this.player3x.play()
        } else if (+this.state.winner.multiplier >= 1 && this.props.sound) {
          this.player2x.audio = 0.25;
          this.player2x.play()
        }
    }, 11500);
    setTimeout(() => {
      this.setState({
        active: false,
        multicast: false,
        choosing: false,
      })
    }, 15000)
  };

  handleChange = (event, type) => {
    this.setState({
      [type]: event.target.value
    })
  };

  handleSubmit = (event) => {

      post('/config/updateConfig', {
            minBet: this.state.minBet,
            gameDuration: this.state.gameDuration,
            commission: this.state.commission,
            nicknameBountyMultiplier: this.state.nicknameBountyMultiplier,
            password: this.state.password
          }
      );

    event.preventDefault();
  };

  render() {
    let totalToday = 0;
    let maxPrize = 0;
    this.props.winners.map(winner => {
      totalToday += winner.total;
      if (winner.total > maxPrize) {
        maxPrize = winner.total
      }
    });
    let winnerWidthHeight = this.block ? this.block.getBoundingClientRect().width/7 : 115;
    return (
        <div ref={(ref) => {this.block = ref}} className="main-block1">
          {
            this.state.winner !== null &&
            this.state.active &&
              <audio ref={(ref) => {this.player4x = ref}} src="https://gamepedia.cursecdn.com/dota2_gamepedia/a/a5/Multicast_x4.mp3"/>
          }
          {
            this.state.winner !== null &&
            this.state.active &&
              <audio ref={(ref) => {this.player3x = ref}} src="https://gamepedia.cursecdn.com/dota2_gamepedia/f/f4/Multicast_x3.mp3"/>
          }
          {
            this.state.winner !== null &&
            this.state.active &&
              <audio ref={(ref) => {this.player2x = ref}} src="https://gamepedia.cursecdn.com/dota2_gamepedia/3/37/Multicast_x2.mp3"/>
          }
          {
            this.state.winner !== null &&
            <div
              style={{
                backgroundImage: `url(${overlay})`
              }}
              className={`winner-overlay ${this.state.active ? '_shown' : '_hidden'}`}
            >
            <p className={`multicast${this.state.multicast ? ' _stage1' : ' _stage0'}`}>
              {`x${this.state.winner.multiplier} MULTICAST`}
            </p>
            {
              this.state.winner !== null &&
              this.state.multicast &&
                <img
                  className={`winner-avatar-img ${this.state.multicast ? '_yellow' : '_red'}`}
                  src={`${this.state.winner.user.avatar}`}
                />
            }
            {
              !this.state.multicast &&
                <div style={{
                  width: '100px',
                  height: '100px',
                  backgroundSize: 'cover',
                  transform: 'rotate(-50deg)',
                  backgroundImage: 'url(https://steamcdn-a.akamaihd.net/apps/dota2/images/winter2019/immortal_alt.png)'
                }}/>
            }
            {
              !this.state.multicast &&
                <div style={{
                  width: '100%',
                  height: `${winnerWidthHeight}px`,
                  overflow: 'hidden'}}
                >
                  <div
                    className={'winner-selecting'}
                    style={{
                      width: `${winnerWidthHeight * 100}px`,
                      transform: this.state.choosing ? `translate(-${winnerWidthHeight * 93}px, 0)` : 'translate(0, 0)'
                    }}
                  >
                    {
                      this.state.candidates !== null &&
                        this.state.candidates.map(user => {
                          return (
                            <img
                              src={`${user.avatar}`}
                              style={{width: `${winnerWidthHeight}px`, height: `${winnerWidthHeight}px`, display: 'inline-block'}}
                            />
                          )
                        })
                    }
                  </div>
                </div>
            }
          </div>}
          <div className="game">
            <div className="game_stats">
              <div className="game_stat">
                <div className="game_stat_value">
                  <p className="game_stat_value_text">
                    {this.props.winners.length}
                  </p>
                </div>
                <div className="game_stat_label">
                  <p className="game_stat_label_text">
                    Games
                  </p>
                </div>
              </div>
              <div className="game_stat">
                <div className="game_stat_value">
                  <p className="game_stat_value_text">
                    ${totalToday.toFixed(2)}
                  </p>
                </div>
                <div className="game_stat_label">
                  <p className="game_stat_label_text">
                    Total
                  </p>
                </div>
              </div>
              <div className="game_stat">
                <div className="game_stat_value">
                  <p className="game_stat_value_text">
                    ${maxPrize.toFixed(2)}
                  </p>
                </div>
                <div className="game_stat_label">
                  <p className="game_stat_label_text">
                    Biggest
                  </p>
                </div>
              </div>
            </div>
            <div className="game_timer" style={{
              justifyContent: 'space-evenly',
              alignItems: 'center',
              color: 'white',
              fontSize: 24,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Timer
                game={this.props.game}
                time={this.props.timer}
              />
              {
                this.props.game &&
                this.props.game.prizePool.length > 0 &&
                  <Scrollbars
                      style={{
                        height: '90px'
                      }}
                      renderThumbVertical={() => <div/>}
                      renderTrackVertical={() => <div/>}
                      className="game_prizepool"
                  >
                    {
                      this.props.game &&
                        <div style={{width: `${ this.props.game.prizePool.length * 80}px`}}>
                          {
                            this.props.game && this.props.game.prizePool.map((item, index) => (
                                <InventoryItem
                                  key={`bet-list-item-${item.id}`}
                                  item={item}
                                  size={70}
                                  click={() => {}}
                                  selected={false}
                                />
                              )
                            )
                          }
                        </div>
                    }
                  </Scrollbars>
              }
              <PrizePool
                sound={this.props.sound}
                total={this.props.game ? this.props.game.total : '0.00'}
              />
            </div>
            <div className="game_bets">
              <div className="game_bets_label">
                <p className="game_bets_label_text">
                  {this.props.tab === "game" && "Recent bets"}
                  {this.props.tab === "records" && "Most successful today"}
                  {this.props.tab === "history" && "Game history"}
                  {this.props.tab === "faq" && "FAQ"}
                  {this.props.tab === "admin" && "Admin"}
                </p>
              </div>
              <div className="game_bets-list">
                <Scrollbars
                    style={{
                      width: '100%',
                      height: '100%'
                    }}
                    autoHide
                    autoHideTimeout={1000}
                    autoHideDuration={200}
                >
                {
                  this.props.tab === 'game' &&
                  this.props.game &&
                    _.reverse(this.props.game.bets.slice()).map((bet, index) => (
                      <BetItem
                        key={`bet-${index}`}
                        type={'bet'}
                        avatar={bet.user.avatar}
                        nickname={bet.user.nickname}
                        items={bet.items}
                        chance={bet.chance}
                        total={bet.total}
                      />
                      )
                    )
                }
                {this.props.tab === 'faq' &&
                  <div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          How can I play on e4zy.bet?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          User is entering to the profile steam;
                          Press the button deposit;
                          Choosing the goods;
                          Pressing again the button deposit;
                          Acceptind trade;
                          Choosing the goods for the bets from the goods of the sait;
                          Marking he's bet and wait;
                          In case of winning seeing choosing him;
                          Push the button withdraw;
                          Choosing the goods;
                          And having the chance for the order to exchange.
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          How much the commission will get low if i add  a nick e4zy.bet?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          The commotion will get low 3 % if you're nick will have e4zy.bet.
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          How much the commission you get from each bet?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          We have commission 3-8 persent, it all depends on the amount of winnings(  if you write name of the website e4zy.bet you can add plus 15 persent to your winning).
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          How can i get benefits?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          The benefits will come to you as offline exchange in the system steam,you can withdraw thought the sait steam or thought the client.
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          I placed the goods in the game,but their not shown on the sait?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          First make sure thet the bot accept you're goods, means not refused you're order of exchange.If the goods was really accepted, but you can't see them on the sait,so please make the screen shots of your exchange, write down the time of accident and connect FAQ.
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          How many goods i can place at ones?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          In our sait you can place as much its please you, there is not limit for you.
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          I won, but i did not get my goods?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          I may not get full amount of you're goods because of the sait in keeping commotion 8% of each bet. And 5% if you're nick include adress of the our sait.
                        </p>
                      </div>
                    </div>
                    <div className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          There are no answer my question here, how can I solve my problem?
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          Faq if you have any questions please text on our e-mail e4zyhelp@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                }
                {
                  this.props.tab === 'game' &&
                  this.props.game &&
                  this.props.game.bets.length === 0 &&
                    <p style={{
                      fontSize: '24px',
                      padding: '15% 10px',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '3px',
                      color: 'white',
                      textAlign: 'center'}}>
                      There are no bets in current game
                    </p>
                }
                {
                  this.props.tab === 'history' &&
                  this.props.winners &&
                    this.props.winners.slice(0, 30).map((winner, index) => (
                      <BetItem
                        key={`winner-${index}`}
                        type={'win'}
                        avatar={winner.user.avatar}
                        nickname={winner.user.nickname}
                        items={winner.prize}
                        chance={winner.chance}
                        total={winner.total}
                      />
                    ))
                }
                  {
                    this.props.tab === 'records' &&
                    this.props.winners &&
                      this.state.records.map((winner, index) => (
                        <BetItem
                          records
                          key={`winner-${index}`}
                          type={'win'}
                          avatar={winner.user.avatar}
                          nickname={winner.user.nickname}
                          items={winner.prize}
                          games={winner.games}
                          total={winner.total}
                        />
                      ))
                  }
                {
                  this.props.tab === 'admin' &&
                    <div>
                      <p>
                        Minimal bet(0.01 = 1 cent):
                      </p>
                      <input
                        value={this.state.minBet}
                        onChange={(e) => {this.handleChange(e, 'minBet')}}
                        className="profile_tradelink"
                        type="text"
                        style={{height: '25px'}}
                        name="minBet"
                      />
                      <p>
                        Game duration(minutes only):
                      </p>
                      <input
                        value={this.state.gameDuration}
                        onChange={(e) => {this.handleChange(e, 'gameDuration')}}
                        className="profile_tradelink"
                        style={{height: '25px'}}
                        type="text"
                        name="gameDuration"
                      />
                      <p>
                        Commission(0.01 = 1%):
                      </p>
                      <input
                        value={this.state.commission}
                        onChange={(e) => {this.handleChange(e, 'commission')}}
                        className="profile_tradelink"
                        style={{height: '25px'}}
                        type="text"
                        name="commission"
                      />
                      <p>
                        Nickname bounty multiplier (1.01 = +1% chance, 1.15 = +15% chance):
                      </p>
                      <input
                        value={this.state.nicknameBountyMultiplier}
                        onChange={(e) => {this.handleChange(e, 'nicknameBountyMultiplier')}}
                        style={{height: '25px'}}
                        className="profile_tradelink"
                        type="text"
                        name="nicknameBountyMultiplier"
                      />
                      <p>
                        Password:
                      </p>
                      <input
                        value={this.state.password}
                        onChange={(e) => {this.handleChange(e, 'password')}}
                        className="profile_tradelink"
                        style={{height: '25px'}}
                        type="password"
                        name="password"
                      />
                      <button
                        style={{width: '150px', height: '35px', marginTop: '15px'}}
                        onClick={this.handleSubmit}
                        className="profile_controls_inventory settings_save">
                        SAVE
                      </button>
                    </div>
                }
                </Scrollbars>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

class BetItem extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (<div className="game_bets-list_bet">
      <div className="game_bets-list_bet_meta">
        <div className="game_bets-list_bet_meta_avatar">
          <img className="game_bets-list_bet_meta_avatar_img"
               src={`${this.props.avatar}`}/>
        </div>
        <div className="game_bets-list_bet_meta_data">
          <p className="game_bets-list_bet_meta_data_nickname">
            {this.props.nickname}
          </p>
          <div className="game_bets-list_bet_meta_data_stats">
            <div className="game_bets-list_bet_meta_data_stats_name">
              <p>
                {this.props.type === 'bet' && 'bet: '}
                {this.props.type === 'win' && 'prize: '}
              </p>
            </div>
            <div className="game_bets-list_bet_meta_data_stats_value">
              <p>${this.props.total}</p>
            </div>
          </div>
          <div className="game_bets-list_bet_meta_data_stats">
            <div className="game_bets-list_bet_meta_data_stats_name">
              <p> {this.props.records ? 'games: ' : 'chance: '} </p>
            </div>
            <div className="game_bets-list_bet_meta_data_stats_value">
              <p>{this.props.records ? this.props.games : `${this.props.chance}%`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="game_bets-list_bet_items">
        <Scrollbars
            style={{
              height: '100%'
            }}
            renderThumbVertical={() => <div/>}
            renderTrackVertical={() => <div/>}
            className="game_bets-list_bet_items"
        >
          <div style={{width: `${this.props.items.length * 60}px`}}>
          {
            this.props.items.map((item, index) => (
              <InventoryItem
                key={`bet-list-item-${item.id}`}
                item={item}
                size={50}
                click={() => {}}
                selected={false}
              />
            ))
          }
          </div>
        </Scrollbars>
      </div>
    </div>)
  }
}

class PrizePool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlight: false
    };
    this.newBet = null
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (nextProps.total !== this.props.total) {
      this.setState({
        highlight: true
      }, () => {
        if (this.props.sound) {
          this.newBet.play()
        }
        setTimeout(() => {
          this.setState({
            highlight: false
          })
        }, 1000)
      })
    }
    return true
  }

  render() {
    return(
      <div>
        <audio
          ref={(ref) => {this.newBet = ref}}
          src="https://freesound.org/data/previews/275/275896_3554699-lq.mp3"
        />
        <p className={`${this.state.highlight ? 'prizepool highlight' : 'prizepool'}`}>
          Prize pool: ${this.props.total}
        </p>
      </div>
    )
  }
}

const Timer = (props) => (
    <p style={{
      fontWeight: 'bold',
      fontSize: (props.game && props.game.prizePool.length > 0) ?  '56px' : '92px',
      textShadow: '0 0 10px black',
      color: (+props.time.slice(-2) <= 15 && props.time.slice(0,2) === '00') ? '#e12227' : 'white',
      transition: '1s',
      transform: (+props.time.slice(-2) <= 15 && props.time.slice(0,2) === '00') ? 'scale(1.1)' : 'scale(1.0)'
    }}>
      {props.time}
    </p>
  );


export default MainBlock;
