// 
// Live Poker Mate API
// 

import axios from 'axios';

const apiClient = axios.create({
    BASEurl: 'https://livepokermate.com:5005/',
    timeout: 1000,
    headers: {}
});

const saveHand = (hand) => apiClient.post('/hands/')
  .then(resp => {
    ;
  }).catch(err => {
    ;
  });