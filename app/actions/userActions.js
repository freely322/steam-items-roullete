import * as actionTypes from '../actionTypes/userActionTypes';

export const set_user = (user = null) => {
    return {
        type: actionTypes.SET_USER,
        user
    }
};

export const set_user_saga = (user = null) => {
    return {
        type: actionTypes.SET_USER_SAGA,
        user
    }
};

export const get_user = () => {
    return {
        type: actionTypes.GET_USER,
    }
};

