import axios from 'axios'

const header = { 
    method: "GET",
    mode: 'cors',
    headers:{
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials':true,
        'Access-Control-Allow-Methods': 'GET'
    }
}
export function getText(url, success, error){
    axios.get(url, header).then(response => {
        response = handleResponse(response)
        return response.data;
    }).then(response=> {
        success(response)
    }).catch(err => {
        error(err)
    })
}

export function getFile(url, success, error){
    axios.get(url, {responseType: 'arraybuffer'}).then(response => {
        response = handleResponse(response)
        return response.data;
    }).then(response=> {
        success(response)
    }).catch(err => {
        error(err)
    })
}

function handleResponse(response){
    if (!response.statues === 200) {
        throw Error(response.statusText);
    }

    return response;
}