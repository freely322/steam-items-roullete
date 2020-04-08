import {fork} from 'redux-saga/effects'
import {getUser} from './userSaga'

export default function* rootSaga() {
    yield fork(getUser);
}
