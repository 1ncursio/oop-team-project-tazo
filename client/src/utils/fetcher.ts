import axios from 'axios';
import backUrl from './backUrl';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true;

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default fetcher;
