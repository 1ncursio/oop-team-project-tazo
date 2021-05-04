import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:7005';
axios.defaults.withCredentials = true;

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default fetcher;
