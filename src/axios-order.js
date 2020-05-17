import axios from 'axios';

const instance= axios.create({
    baseURL :'https://react-burger-builder-c7dc7.firebaseio.com/'
});


export default instance;