import { call, put } from 'redux-saga/effects';
import { get } from '../fetch';
import { IndexActionTypes} from '../actionTypes';

export function* getUser() {
    yield put({type: IndexActionTypes.FETCH_START});
    try {
        return yield call(get, '/user');
    } catch (err) {
        yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: "Can't Get User", msgType: 0});
    } finally {
        yield put({type: IndexActionTypes.FETCH_END})
    }
}

