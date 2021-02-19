const getCookie = name =>{
    if (document.cookie && document.cookie !== '') {
        for (const cookie of document.cookie.split('; ')){
            const [key, value] = cookie.trim().split('=');
            if(key === name) {
                return decodeURIComponent(value);
            }
        }
    }
};
const csrftoken = getCookie('csrftoken');
const timezone = getCookie('timezone');
const access = getCookie('access');