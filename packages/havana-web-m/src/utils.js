import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export function getUserFromHtml() {

    let elem = document.getElementById('USER_NAME');
    const userName = elem ? elem.textContent : '';
    elem = document.getElementById('USER_ACCOUNT_NAME');
    const accountName = elem ? elem.textContent : '';
    elem = document.getElementById('USER_ID');
    const userID = elem ? elem.textContent : '313069486';
    elem = elem ? document.getElementById('USER_THUMBNAIL') : '';
    const imageData = elem ? elem.textContent  : '';

    return {
        name: userName,
        account_name: accountName,
        userID:  userID,
        imageData: imageData
    }
}

export function getHost() {
    const elem = document.getElementById('HOST');
    return elem? elem.textContent : 'bizdev01/ps';
}

export function getProtocol() {
    const elem = document.getElementById('PROTOCOL');
    return elem ? elem.textContent : 'http';
}

export const API = axios.create({
        baseURL: `${getProtocol()}://${getHost()}`,
        //responseType: "json"
    })

const mock = new MockAdapter(API);

mock.onAny('/me')
    .reply(200, {
        "userAccountName": "c1306948",
        "userName": "אולג קליימן - טכנולוג אינטגרצייה",
        "isManager": false,
        "ID": "313069486"    
})

mock.onAny('/daysoff')
    .reply(200, {
    "items":[{
                "date":"2020-07-30T00:00:00",
                "description":"תשעה באב"
            }
        ]
})

mock.onAny('/me/report_codes')
    .reply(200, {
    "items":[{
            "Code":10,
            "Description":"חופשה מנוחה",
            "ShortDecription":"חופשה",
            "goodFor":2
        },
        {
            "Code":20,
            "Description":"מחלה",
            "ShortDecription":"מחלה",
            "goodFor":2
        },
        {
            "Code":624,
            "Description":"עבודה מהבית",
            "ShortDecription":"ע.מהבית",
            "goodFor":2
        }
    ]        
    })

mock.onAny('/me/reports/status')
    .reply(200, 
    {
        "ownerId":"אולג קליימן - טכנולוג אינטגרצייה",
        "ownerName":null,
        "assignedTo":"x2273504",
        "assignedToName":"ליאורה שכטר",
        "submitted":true,
        "approved":false,
        "rejected":false,
        "resubmitted":false,
        "note":"",
        "whenSubmitted":"2020-08-21T13:39:58.847",
        "whenApproved":null,
        "whenRejected":null,
        "approvedBy":"",
        "month":7,
        "year":2020,
        "employerCode":"0",
        "saveReportId":"06d07549-5628-4962-bcdb-6a4319a2ee15"
    }
)

mock.onAny('/me/manual_updates')
    .reply(200,
    {
        "Year":2020,
        "Month":7,
        "UserID":"c1306948",
        "items":[
            {
                "Day":14,
                "WhenUpdated":"2020-08-21T13:39:58",
                "InOut":true
            },
            {"Day":14,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":16,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":16,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":15,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":15,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":2,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":2,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":5,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":5,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":6,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":6,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":7,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":7,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":8,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":8,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":19,"WhenUpdated":"2020-08-21T13:39:58","InOut":true},
            {"Day":19,"WhenUpdated":"2020-08-21T13:39:58","InOut":false},
            {"Day":20,"WhenUpdated":"2020-08-21T13:39:59","InOut":true},
            {"Day":20,"WhenUpdated":"2020-08-21T13:39:59","InOut":false},
            {"Day":21,"WhenUpdated":"2020-08-21T13:39:59","InOut":true},
            {"Day":21,"WhenUpdated":"2020-08-21T13:39:59","InOut":false},
            {"Day":23,"WhenUpdated":"2020-08-21T13:39:59","InOut":true},
            {"Day":23,"WhenUpdated":"2020-08-21T13:39:59","InOut":false},
            {"Day":27,"WhenUpdated":"2020-08-21T13:39:59","InOut":true},
            {"Day":27,"WhenUpdated":"2020-08-21T13:39:59","InOut":false},
            {"Day":28,"WhenUpdated":"2020-08-21T13:39:59","InOut":true},
            {"Day":28,"WhenUpdated":"2020-08-21T13:39:59","InOut":false},
            {"Day":29,"WhenUpdated":"2020-08-21T13:39:59","InOut":true},
            {"Day":29,"WhenUpdated":"2020-08-21T13:39:59","InOut":false}
    ]}
)

mock.onAny('/me/reports/saved')
    .reply(200, {
        "ownerName":"אולג קליימן - טכנולוג אינטגרצייה",
        "year":2020,
        "month":7,
        "totalHours":191.10,
        "isEditable":false,
        "isApproved":false,
        "isRejected":false,
        "whenRejected":null,
        "reSubmitted":false,
        "note":"",
        "whenApproved":null,
        "employerCode":"0",
        "items":[
            {
                "id":87864,
                "rdate":"2020-07-01T00:00:00",
                "day":"1",
                "isWorkingDay":false,
                "dayOfWeek":"ד",
                "entry":"10:54",
                "exit":"18:22",
                "notes":"",
                "total":"7:28",
                "isAdded":false,
                "reportType":""
            },
            {
                "id":87865,
                "rdate":"2020-07-02T00:00:00",
                "day":"2",
                "isWorkingDay":false,
                "dayOfWeek":"ה",
                "entry":"10:00",
                "exit":"18:00",
                "notes":"Cadence workflow implementation",
                "total":"8:00",
                "isAdded":false,
                "reportType":"ע.מהבית"
            },
            {"id":87866,"rdate":"2020-07-03T00:00:00","day":"3","isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87867,"rdate":"2020-07-04T00:00:00","day":"4","isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87868,"rdate":"2020-07-05T00:00:00","day":"5","isWorkingDay":false,"dayOfWeek":"א","entry":"10:00","exit":"18:00","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87869,"rdate":"2020-07-06T00:00:00","day":"6","isWorkingDay":false,"dayOfWeek":"ב","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87870,"rdate":"2020-07-07T00:00:00","day":"7","isWorkingDay":false,"dayOfWeek":"ג","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87871,"rdate":"2020-07-08T00:00:00","day":"8","isWorkingDay":false,"dayOfWeek":"ד","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87872,"rdate":"2020-07-09T00:00:00","day":"9","isWorkingDay":false,"dayOfWeek":"ה","entry":"11:22","exit":"20:14","notes":"","total":"8:52","isAdded":false,"reportType":""},{"id":87873,"rdate":"2020-07-10T00:00:00","day":"10","isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87874,"rdate":"2020-07-11T00:00:00","day":"11","isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87875,"rdate":"2020-07-12T00:00:00","day":"12","isWorkingDay":false,"dayOfWeek":"א","entry":"10:30","exit":"20:37","notes":"","total":"10:07","isAdded":false,"reportType":""},{"id":87876,"rdate":"2020-07-13T00:00:00","day":"13","isWorkingDay":false,"dayOfWeek":"ב","entry":"11:24","exit":"20:48","notes":"","total":"9:24","isAdded":false,"reportType":""},{"id":87877,"rdate":"2020-07-14T00:00:00","day":"14","isWorkingDay":false,"dayOfWeek":"ג","entry":"11:00","exit":"20:30","notes":"","total":"9:30","isAdded":false,"reportType":"ע.מהבית"},{"id":87878,"rdate":"2020-07-15T00:00:00","day":"15","isWorkingDay":false,"dayOfWeek":"ד","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87879,"rdate":"2020-07-16T00:00:00","day":"16","isWorkingDay":false,"dayOfWeek":"ה","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87880,"rdate":"2020-07-17T00:00:00","day":"17","isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87881,"rdate":"2020-07-18T00:00:00","day":"18","isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87882,"rdate":"2020-07-19T00:00:00","day":"19","isWorkingDay":false,"dayOfWeek":"א","entry":"0:00","exit":"0:00","notes":"","total":"7:59","isAdded":false,"reportType":""},{"id":87883,"rdate":"2020-07-19T00:00:00","day":"19","isWorkingDay":false,"dayOfWeek":"א","entry":"10:24","exit":"14:44","notes":"","total":"4:20","isAdded":false,"reportType":""},{"id":87884,"rdate":"2020-07-19T00:00:00","day":"19","isWorkingDay":false,"dayOfWeek":"א","entry":"18:00","exit":"21:40","notes":"","total":"3:40","isAdded":false,"reportType":"ע.מהבית"},{"id":87885,"rdate":"2020-07-20T00:00:00","day":"20","isWorkingDay":false,"dayOfWeek":"ב","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87886,"rdate":"2020-07-21T00:00:00","day":"21","isWorkingDay":false,"dayOfWeek":"ג","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87887,"rdate":"2020-07-22T00:00:00","day":"22","isWorkingDay":false,"dayOfWeek":"ד","entry":"11:06","exit":"20:51","notes":"","total":"9:45","isAdded":false,"reportType":""},{"id":87888,"rdate":"2020-07-23T00:00:00","day":"23","isWorkingDay":false,"dayOfWeek":"ה","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87889,"rdate":"2020-07-24T00:00:00","day":"24","isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87890,"rdate":"2020-07-25T00:00:00","day":"25","isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""},{"id":87891,"rdate":"2020-07-26T00:00:00","day":"26","isWorkingDay":false,"dayOfWeek":"א","entry":"10:46","exit":"18:47","notes":"","total":"8:01","isAdded":false,"reportType":""},{"id":87892,"rdate":"2020-07-27T00:00:00","day":"27","isWorkingDay":false,"dayOfWeek":"ב","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87893,"rdate":"2020-07-28T00:00:00","day":"28","isWorkingDay":false,"dayOfWeek":"ג","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87894,"rdate":"2020-07-29T00:00:00","day":"29","isWorkingDay":false,"dayOfWeek":"ד","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87895,"rdate":"2020-07-30T00:00:00","day":"30","isWorkingDay":false,"dayOfWeek":"ה","entry":"10:30","exit":"18:30","notes":"","total":"8:00","isAdded":false,"reportType":"ע.מהבית"},{"id":87896,"rdate":"2020-07-31T00:00:00","day":"31","isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00","exit":"0:00","notes":"","total":"0:00","isAdded":false,"reportType":""}
        ]})
