import * as actionTypes from '../actionTypes/gameActionTypes';

export const set_game = (user = null) => {
    return {
        type: actionTypes.SET_GAME,
        user
    }
};

export const set_winners = (user = null) => {
    return {
        type: actionTypes.SET_WINNERS,
        user
    }
};

export const set_config = (user = null) => {
    return {
        type: actionTypes.SET_CONFIG,
        user
    }
};

export const set_tab = (user = null) => {
    return {
        type: actionTypes.SET_TAB,
        user
    }
};


export const toggle_sound = () => {
    return {
        type: actionTypes.TOGGLE_SOUND,
    }
};

