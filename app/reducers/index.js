import {combineReducers} from 'redux';
import { IndexActionTypes, UserActionTypes, GameActionTypes } from '../actionTypes';

const initialState = {
    isFetching: true,
    user: null,
    game: null,
    winners: [],
    config: null,
    tab: "game",
    sound: true
};

export function app(state = initialState, action) {
    switch (action.type) {
        case IndexActionTypes.FETCH_START:
            return {
                ...state, isFetching: true
            };
        case IndexActionTypes.FETCH_END:
            return {
                ...state, isFetching: false
            };
        case IndexActionTypes.SET_MESSAGE:
            return {
                ...state,
                isFetching: false,
                msg: {
                    type: action.msgType,
                    content: action.msgContent
                }
            };
        case UserActionTypes.SET_USER:
            return {
                ...state,
                isFetching: false,
                user: action.user
            };
        case GameActionTypes.SET_GAME:
            let game = Object.assign({}, action.user);
            let total = 0;
            let prizePool = [];
            game.bets.map(bet => {
                bet.items.map(item => {
                    total += item.price;
                    prizePool.push(item)
                })
            });
            total = total.toFixed(2);
            game.total = total;
            game.prizePool = prizePool;
            game.bets.map(bet => {
                let weight = 0;
                bet.items.map(item => {
                    weight += item.price
                })
                bet.total = weight.toFixed(2)
                bet.chance =(weight * 100 / total).toFixed(2)
            })
            return {
                ...state,
                isFetching: false,
                game: game
            };
        case GameActionTypes.SET_WINNERS:
            return {
                ...state,
                isFetching: false,
                winners: action.user
            };
        case GameActionTypes.SET_CONFIG:
            return {
                ...state,
                isFetching: false,
                config: action.user
            };
        case GameActionTypes.SET_TAB:
            return {
                ...state,
                isFetching: false,
                tab: action.user
            };
        case GameActionTypes.TOGGLE_SOUND:
            return {
                ...state,
                isFetching: false,
                sound: !state.sound
            };
        default:
            return state
    }
}

export default combineReducers({app})
