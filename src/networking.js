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
    fetch(url, header).then(response => {
        response = handleResponse(response)
        return response.text();
    }).then(response=> {
        success(response)
    }).catch(err => {
        error(err)
    })
}

function handleResponse(response){
    if (!response.ok) {
        throw Error(response.statusText);
    }

    return response;
}