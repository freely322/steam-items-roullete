import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment-timezone';
import { Scrollbars } from 'react-custom-scrollbars';
import {faArrowAltCircleRight, faComments} from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'
import style from './style.scss';
import InventoryItem from "../InventoryItem/InventoryItem";

class HelperBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      message: ''
    };
    this.block = null;
    this.messagesEnd = null
  }

  componentDidMount() {
    this.checkSize();
    addEventListener('resize', this.checkSize)
  }

  componentWillUnmount() {
    removeEventListener('resize', this.checkSize)
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (!_.isEqual(nextState, this.state)) {
      return true
    }
    if (!_.isEqual(nextProps.tab, this.props.tab)) {
      return true
    }
    if (!_.isEqual(nextProps.selectedItems, this.props.selectedItems)) {
      return true
    }
    if (!_.isEqual(nextProps.inventory, this.props.inventory)) {
      return true
    }
    if (!_.isEqual(nextProps.game, this.props.game)) {
      return true
    }
    if (!_.isEqual(nextProps.selectedItems, this.props.selectedItems)) {
      return true
    }
    if (!_.isEqual(nextProps.chat.length, this.props.chat.length)) {
      setTimeout(this.scrollToBottom, 1000);
      return true
    }
    if (!_.isEqual(nextProps.user, this.props.user)) {
      this.setState({
        value: nextProps.user ? nextProps.user.tradeLink : ''
      });
      return true
    }
    return false
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' })
  };

  checkSize = () => {
    if (this.block) {
      let {width, height} = this.block.getBoundingClientRect();
      this.setState({
        width,
        height
      })
    }
  }

  goDeposit = () => {
    this.props.setHelperTab('deposit')
  };

  goChat = () => {
    this.props.setHelperTab('chat')
  };

  goWithdraw = () => {
    this.props.setHelperTab('withdraw')
  };

  handleChange = (event, type) => {
      this.setState({
        message: event.target.value
      })
  };

  handleSubmit = (event) => {
    if (this.props.user && this.state.message.length > 0) {
      this.props.socket.binary(false).emit('chatMessage', {
        text: this.state.message,
        time: moment().tz('Europe/Minsk').format('HH:mm'),
        nickname: this.props.user.username
      })
      this.setState({
        message: ''
      })
    }
    event.preventDefault();
  }

  render() {
    let buttonAction = null;
    switch(this.props.tab) {
      case('inventory'):
        buttonAction = this.props.betItems;
        break;
      case('withdraw'):
        buttonAction = this.props.withdrawItems;
        break;
      case('deposit'):
        buttonAction = this.props.addItems;
        break;
    }
    let depositTotal = 0;
    let depositTotalChance = 0;
    let inventoryTotal = 0;
    let inventoryTotalChance = 0;
    let selectedTotal = 0;
    let selectedTotalChance = 0;
    if (this.props.selectedItems.length > 0) {
      let currentItemPool = null;
      switch (this.props.tab) {
        case "inventory":
          currentItemPool = this.props.user.inventory;
          break
        case "deposit":
          currentItemPool = this.props.inventory;
          break
        case "withdraw":
          currentItemPool = []
      }
      this.props.selectedItems.map(item => {
        selectedTotal += item.price
      });
      if (this.props.game) {
        if (+this.props.game.total < 0.1) {
          selectedTotalChance = 100
        } else {
          selectedTotalChance = ((selectedTotal * 100) / (parseInt(this.props.game.total)+selectedTotal)).toFixed(2)
        }
      }
    }
    selectedTotal = selectedTotal.toFixed(2);
    this.props.inventory.map(item => {
      depositTotal += +item.price
    })
    this.props.user && this.props.user.inventory.map(item => {
      inventoryTotal += +item.price
    });
    if (this.props.game) {
      if (+this.props.game.total < 0.1) {
        depositTotalChance = 100;
        inventoryTotalChance = 100
      } else {
        depositTotalChance = ((depositTotal * 100) / (parseInt(this.props.game.total)+depositTotal)).toFixed(2);
        inventoryTotalChance = ((inventoryTotal * 100) / (parseInt(this.props.game.total)+inventoryTotal)).toFixed(2)
      }
    }
    depositTotal = depositTotal.toFixed(2);
    inventoryTotal = inventoryTotal.toFixed(2);
    return (
        <div className="main-block3">
          {
            (this.props.tab === 'inventory' ||
              this.props.tab === 'deposit' ||
              this.props.tab === 'withdraw') &&
              <div className="inventory" >
                <div className="chat_label" style={{position: 'relative'}}>
                  <p className="chat_label_text">
                    {this.props.tab === 'inventory' && 'Inventory'}
                    {this.props.tab === 'deposit' && 'Deposit'}
                    {this.props.tab === 'withdraw' && 'Withdraw'}
                  </p>
                  <FontAwesomeIcon
                    onClick={this.goChat}
                    icon={faComments}
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      width: '30px',
                      height: '30px',
                      position: 'absolute',
                      right: '15px'}}
                  />
                </div>
                {
                  (
                    this.props.tab === 'inventory' ||
                    this.props.tab === 'withdraw'
                  ) &&
                  <div
                    className="inventory_items"
                    ref={(ref) => {this.block = ref; this.checkSize()}}
                  >
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
                      this.props.user &&
                      this.props.user.inventory.map((item) => {
                        return(
                            <InventoryItem
                              key={`deposit-item-${item.id}`}
                              item={item}
                              size={(this.state.width / 5.6) - 5}
                              click={this.props.selectItem}
                              selecting={'inventory'}
                              selected={this.props.selectedItems.includes(item)}
                            />
                          )
                      })}
                    </Scrollbars>
                  </div>
                }
                {
                  this.props.tab === 'deposit' &&
                  <div
                    className="inventory_items"
                    ref={(ref) => {this.block = ref; this.checkSize()}}
                  >
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
                      this.props.user &&
                      this.props.inventory.map((item) => {
                        return(
                            <InventoryItem
                              key={`deposit-item-${item.id}`}
                              item={item}
                              size={(this.state.width / 5.6) - 5}
                              click={this.props.selectItem}
                              selecting={'deposit'}
                              selected={this.props.selectedItems.includes(item)}
                            />
                          )
                      })
                    }
                    </Scrollbars>
                </div>
                }
                <div className="inventory_stats">
                  <div className="profile_stat">
                    <div>
                      <p className="profile_stat_name">
                        {this.props.selectedItems.length > 0 ? 'Selected Total' : 'Total'}
                      </p>
                      <span className="profile_stat_value">
                        {this.props.selectedItems.length > 0 && selectedTotal}
                        ${this.props.selectedItems.length === 0 && this.props.tab === 'deposit' && depositTotal}
                        {this.props.selectedItems.length === 0 && this.props.tab === 'inventory' && inventoryTotal}
                      </span>
                    </div>
                  </div>
                  <div className="profile_stat">
                    <div>
                      <p className="profile_stat_name">
                        {this.props.selectedItems.length > 0 ? 'Selected Count' : 'Count'}
                      </p>
                      <span className="profile_stat_value">
                        {this.props.selectedItems.length > 0 && this.props.selectedItems.length}
                        {this.props.selectedItems.length === 0 && this.props.tab === 'deposit' && this.props.inventory.length}
                        {this.props.selectedItems.length === 0 && this.props.tab === 'inventory' && this.props.user && this.props.user.inventory.length}
                      </span>
                    </div>
                  </div>
                  <div className="profile_stat">
                    <div>
                      <p className="profile_stat_name">
                        {this.props.selectedItems.length > 0 ? 'Selected Chance' : 'Total Chance'}
                      </p>
                      <span className="profile_stat_value">
                        {this.props.selectedItems.length > 0 && selectedTotalChance}
                        {this.props.selectedItems.length === 0 && this.props.tab === 'deposit' && depositTotalChance}
                        {this.props.selectedItems.length === 0 && this.props.tab === 'inventory' && inventoryTotalChance}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="inventory_controls">
                  <button onClick={this.goDeposit} className="inventory_controls_side">Deposit</button>
                  <button onClick={buttonAction} className="inventory_controls_center">
                    {this.props.tab === 'inventory' && 'Play'}
                    {this.props.tab === 'deposit' && 'Deposit'}
                    {this.props.tab === 'withdraw' && 'Withdraw'}
                  </button>
                  <button onClick={this.goWithdraw} className="inventory_controls_side">Withdraw</button></div>
              </div>
          }
          {this.props.tab === 'chat' && <div className="chat" style={{width: '100%'}}>
            <div className="chat_label">
              <p className="chat_label_text">Chat</p>
            </div>
            <div className="chat_msg-list">
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
                  this.props.chat.map((message, index) => (
                    <div key={`message-${index}`} className="chat_msg-list_msg">
                      <div className="chat_msg-list_msg_meta">
                        <p className="chat_msg-list_msg_meta_nickname">
                          {message.nickname}
                        </p>
                        <p className="chat_msg-list_msg_meta_time">
                          {message.time}
                        </p>
                      </div>
                      <div className="chat_msg-list_msg_data">
                        <p className="chat_msg-list_msg_data_text">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))
                }
                <div ref={(ref) => {this.messagesEnd = ref}} />
              </Scrollbars>
            </div>
            <form className="chat_form">
              <input
                value={this.state.message}
                onChange={this.handleChange}
                className="chat_form_input"
                type="text" />
              <button
                type="submit"
                onClick={this.handleSubmit}
                className="chat_form_submit"
              >
                <FontAwesomeIcon
                  icon={faArrowAltCircleRight}
                  className={'submit_icon'}
                />
              </button>
            </form>
          </div>}
        </div>
    )
  }
}

export default HelperBlock;
