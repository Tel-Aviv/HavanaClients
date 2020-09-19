import axios from 'axios';
//import MockAdapter from 'axios-mock-adapter';

export function getUserFromHtml() {

    let elem = document.getElementById('USER_NAME');
    const userName = elem ? elem.textContent : 'אולג קליימן';
    elem = document.getElementById('USER_ACCOUNT_NAME');
    const accountName = elem ? elem.textContent : 'c1306948';
    elem = document.getElementById('USER_ID');
    const userID = elem ? elem.textContent : '313069486';
    elem = document.getElementById('USER_THUMBNAIL');
    const imageData = elem ? elem.textContent : '';

    return {
        name: userName,
        account_name: accountName,
        userID:  userID,
        imageData: imageData
    }
}

export function getHost() {
    const elem = document.getElementById('HOST');
    return elem ? elem.textContent : 'bizdev01/PS';
}

export function getProtocol() {
    const elem = document.getElementById('PROTOCOL');
    return elem ? elem.textContent : 'http';
}

export const TextualEmployeKind = {
    "1": `נש"מ`,
    "2": `עובד עיריית ת"א`
}

export const API = axios.create({
        baseURL: `${getProtocol()}://${getHost()}`,
        //responseType: "json"
})

