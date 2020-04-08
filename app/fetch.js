import axios from 'axios'
import appConfig from '../config';

const requestUrl = `${appConfig.host}`;
const requestPort = `${appConfig.port}`;

let config = {
    baseURL: process.env.NODE_ENV === 'production' ? `https://${requestUrl}` : `http://${requestUrl}:${requestPort}/api`,
    transformResponse: [
        (data) => {
            return data
        }
    ],
    headers: {
        'Content-Type': 'application/json'
    },
    responseType: 'json'
};

axios.interceptors.response.use((res) => {
    return res.data;
});

export const get = (url) => {
    return axios.get(url, Object.assign({url: url}, config))
};

export const post = (url, data) => {
    return axios.post(url, data, Object.assign({url: url}, config))
};

export const update = (url, data) => {
    return axios.put(url, data, Object.assign({url: url}, config))
};
export const remove = (url) => {
    return axios.delete(url, Object.assign({url: url}, config))
};
