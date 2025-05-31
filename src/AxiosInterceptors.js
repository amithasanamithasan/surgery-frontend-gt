import axios from "axios";
import GlobalFunction from './GlobalFunction';
import Constant from './Constant';

// AxiosWithOutAuthInstance
const AxiosWithOutAuthInstance = axios.create({
    baseURL: Constant.BASE_URL + '/',
    timeout: 24000
});

// AxiosAuthInstance
const headers = {
    Authorization: `Bearer ${ localStorage.token }`,
    Accept: 'application/json'
};

const AxiosAuthInstance = axios.create({
    baseURL: Constant.BASE_URL + '/',
    timeout: 24000,
    headers
});

AxiosAuthInstance.interceptors.request.use(
    (config) => {
        config.headers["Accept"] = 'application/json';
        config.headers["Authorization"] = `Bearer ${ localStorage.getItem("token") }`;
        return config;
    },
    (error) => {
        if (error?.response?.status === 401) {
          GlobalFunction.logout()
        }
        return Promise.reject(error);
    }
);

AxiosAuthInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
          GlobalFunction.logout()
        }
        return Promise.reject(error);
    }
);

export { AxiosWithOutAuthInstance, AxiosAuthInstance };