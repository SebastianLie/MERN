import api from './api';

// store our JWT in LS and set axios headers if we do have a token
// make a header
const setAuthToken = (token) => {
    if (token) {
        // So the reason we're doing this is so that when we have a token we we're just going to send it with every
        // request instead of picking and choosing which request to send it with.
        api.defaults.headers.common['x-auth-token'] = token;
        localStorage.setItem('token', token);
      } else {
        // If what we pass in is not a token, then we're going to delete it from the global headers.
        delete api.defaults.headers.common['x-auth-token'];
        localStorage.removeItem('token');
      }
};

export default setAuthToken;