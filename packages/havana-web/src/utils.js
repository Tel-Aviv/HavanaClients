import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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

export const DEFAULT_BASE_URL = `${getProtocol()}://${getHost()}`;

export const API = axios.create({
        baseURL: DEFAULT_BASE_URL,
        withCredentials: true
        //responseType: "json"
});

// Injected in webpack thru DefinePlugin
if( process.env.mock ) {
    const mock = new MockAdapter(API, { delayResponse: 1000 });

    mock.onAny('/me/is_manager')
        .reply(200, true)

    mock.onGet('/me/pendings/count')
        .reply(200, 3);    

    mock.onAny('/me')
        .reply(200, {
            "userAccountName": "c1306948",
            "userName": "אולג קליימן - טכנולוג אינטגרצייה",
            "isManager": false,
            "ID": "313069486",
            "kind": 2,
            "signature": "",
            "stamp": "",
            "direct_manager": {
                "userAccountName": "x2783703",
                "userName": "הילי זילבנסקי",
                "isManager": true,
                "ID": null,
                "kind": 0,
                "direct_manager": null,
                "managers": null,
                "signature": null,
                "stamp": null

            },
            "managers": []   
    })

    mock.onGet(/\/me\/reports\/\d+\/\d+\/docs/)
        .reply(200, []);

    mock.onGet('/daysoff')
        .reply(200, {
        "items":[{
                    "date":"2020-07-30T00:00:00",
                    "description":"תשעה באב"
                }
            ]
    });

    mock.onGet('/me/report_codes')
        .reply(200, {
        "codes":[{
                "Code": 1,
                "Description": "עבודה רגילה",
                "ShortDescription": "",
                "goodFor": 1
            },
            {
                "Code":10,
                "Description":"חופשה מנוחה",
                "ShortDescription":"חופשה",
                "goodFor":2
            },
            {
                "Code":20,
                "Description":"מחלה",
                "ShortDescription":"מחלה",
                "goodFor":2
            },
            {
                "Code":624,
                "Description":"עבודה מהבית",
                "ShortDescription":"ע.מהבית",
                "goodFor":2
            }
        ]        
        })

    mock.onGet('/system_notes')
        .reply(200,
            {
                "notes": [
                  {
                    "name": "איחור",
                    "severityCode": 0
                  },
                  {
                    "name": "*העדרות",
                    "severityCode": 1
                  },
                  {
                    "name": "לא פעיל",
                    "severityCode": 0
                  },
                  {
                    "name": "*חסר הסכם",
                    "severityCode": 1
                  },
                  {
                    "name": "*יום חריג",
                    "severityCode": 0
                  },
                  {
                    "name": "*לא מאושר",
                    "severityCode": 1
                  },
                  {
                    "name": "*חסרה יציאה",
                    "severityCode": 1
                  },
                  {
                    "name": "*חסרה כניסה",
                    "severityCode": 1
                  },
                  {
                    "name": "*עבודת לילה",
                    "severityCode": 0
                  },
                  {
                    "name": "*אין קוד יום",
                    "severityCode": 1
                  },
                  {
                    "name": "כניסת שבת.*ע",
                    "severityCode": 0
                  },
                  {
                    "name": "*עבודה בפגרה",
                    "severityCode": 0
                  },
                  {
                    "name": "*יציאה מאוחרת",
                    "severityCode": 0
                  },
                  {
                    "name": "*כניסה מוקדמת",
                    "severityCode": 0
                  },
                  {
                    "name": "עבודה מעל 12 ש",
                    "severityCode": 0
                  },
                  {
                    "name": "תקציבי.*חסר ס",
                    "severityCode": 1
                  },
                  {
                    "name": "*.זמן קטן ממינ",
                    "severityCode": 0
                  },
                  {
                    "name": "*.חופף תקופ שג",
                    "severityCode": 1
                  },
                  {
                    "name": "*.חפף רצועה שג",
                    "severityCode": 1
                  },
                  {
                    "name": ".נוספ.*חריגה ש",
                    "severityCode": 1
                  },
                  {
                    "name": ".שג .אוטו .*יצ",
                    "severityCode": 1
                  },
                  {
                    "name": ".שג.אוטו .*כנס",
                    "severityCode": 1
                  },
                  {
                    "name": "*אין מספר הסכם",
                    "severityCode": 1
                  },
                  {
                    "name": "*דווח לא מאושר",
                    "severityCode": 1
                  },
                  {
                    "name": "הצהרה.*גמר מכס",
                    "severityCode": 1
                  },
                  {
                    "name": "יום בהס.*אין ק",
                    "severityCode": 1
                  },
                  {
                    "name": "*כנ.מקד/פ.מחצי",
                    "severityCode": 0
                  },
                  {
                    "name": "*מרווח קטן משע",
                    "severityCode": 1
                  },
                  {
                    "name": "פחות מחצי יום",
                    "severityCode": 0
                  },
                  {
                    "name": "*רצועות נוספות",
                    "severityCode": 0
                  },
                  {
                    "name": "*שגיאת פיצולים",
                    "severityCode": 1
                  }
                ]
              })


    mock.onGet('/me/reports/manual_updates')
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
    );

    mock.onPost('/me/reports/manual_updates')
    .reply(200);

    mock.onPost('/me/report/save')
    .reply(200);

    mock.onGet('system_notes')
    .reply(200, { 
        "notes": [{
                name: "איחור",
                severityCode: 0
            }, {
                name: '*העדרות',
                severityCode: 1
            }, {
                name: '*חסרה יציאה',
                severityCode: 1
            }, {
                name: '*חסרה כניסה',
                severityCode: 1
            }
        ]
    })

    mock.onGet(/\/me\/reports\/\d+\/\d+/)
        .reply(200, {
            "ownerName":"אולג קליימן - טכנולוג אינטגרצייה",
            "year":2020,
            "month":7,
            "totalHours":191.10,
            "isEditable":true,
            "isApproved":false,
            "isRejected":false,
            "whenRejected":null,
            "reSubmitted":false,
            "note":"",
            "whenApproved":null,
            "employerCode":"101",
            "items":[
                {
                    "id":87864,
                    "rdate":"2020-07-01T00:00:00",
                    "day":"1",
                    "stripId": 1,
                    "isWorkingDay":false,
                    "dayOfWeek":"ד",
                    "entry":"10:54",
                    "exit":"18:22",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"",
                    "total":"7:28",
                    "isAdded":false,
                    "reportCode":""
                },
                {
                    "id":87865,
                    "rdate":"2020-07-02T00:00:00",
                    "day":"2",
                    "stripId": 1,
                    "isWorkingDay":false,
                    "dayOfWeek":"ה",
                    "entry":"10:00",
                    "exit":"18:00",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"Cadence workflow implementation",
                    "total":"8:00",
                    "isAdded":false,
                    "reportCode":"ע.מהבית"
                },
                {"id":87866,
                    "rdate":"2020-07-03T00:00:00",
                    "day":"3",
                    "stripId": 1,
                    "isWorkingDay":false,
                    "dayOfWeek":"ו",
                    "entry":"0:00",
                    "exit":"0:00",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",                    
                    "userNotes":"",
                    "total":"0:00",
                    "isAdded":false,
                    "reportCode":""
                },
                {"id":87867,
                    "rdate":"2020-07-04T00:00:00",
                    "day":"4",
                    "stripId": 1,
                    "isWorkingDay":false,
                    "dayOfWeek":"ש",
                    "entry":"0:00",
                    "exit":"0:00",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",     
                    "userNotes":"",
                    "total":"0:00",
                    "isAdded":false,
                    "reportCode":""
                },
                {"id":87868,
                    "rdate":"2020-07-05T00:00:00",
                    "day":"5",
                    "stripId": 1,
                    "isWorkingDay":false,
                    "dayOfWeek":"א",
                    "entry":"10:00",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",     
                    "userNotes":"",
                    "total":"8:00",
                    "isAdded":false,
                    "reportCode":"ע.מהבית"
                },
                {"id":87869,"rdate":"2020-07-06T00:00:00",
                    "day":"6",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ב",
                    "entry":"10:30","exit":"18:30",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87870,"rdate":"2020-07-07T00:00:00",
                    "day":"7",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ג",
                    "entry":"10:30",
                    "exit":"18:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87871,"rdate":"2020-07-08T00:00:00",
                    "day":"8",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ד","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87872,"rdate":"2020-07-09T00:00:00",
                    "day":"9",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ה","entry":"11:22","exit":"20:14",
                    "required": "8:24",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:52","isAdded":false,"reportCode":""},
                {"id":87873,"rdate":"2020-07-10T00:00:00",
                    "day":"10",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00","exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"0:00","isAdded":false,"reportCode":""},
                {"id":87874,"rdate":"2020-07-11T00:00:00",
                    "day":"11",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00","exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"0:00","isAdded":false,"reportCode":""},
                {"id":87875,"rdate":"2020-07-12T00:00:00",
                    "day":"12",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"א","entry":"10:30",
                    "exit":"20:37",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"10:07","isAdded":false,"reportCode":""},
                {"id":87876,"rdate":"2020-07-13T00:00:00",
                    "day":"13",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ב","entry":"11:24",
                    "exit":"20:48",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"9:24","isAdded":false,"reportCode":""},
                {"id":87877,"rdate":"2020-07-14T00:00:00",
                    "day":"14",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ג","entry":"11:00",
                    "exit":"20:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"","total":"9:30","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87878,"rdate":"2020-07-15T00:00:00",
                    "day":"15",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ד","entry":"10:30","exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87879,
                    "rdate":"2020-07-16T00:00:00",
                    "day":"16",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ה","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"",
                    "total":"8:00",
                    "isAdded":false,
                    "reportCode":"ע.מהבית"},
                {"id":87880,
                    "rdate":"2020-07-17T00:00:00",
                    "day":"17",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00",
                    "exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "*העדרות",
                    "userNotes":"",
                    "total":"0:00",
                    "isAdded":false,
                    "reportCode":""},
                {"id":87881,"rdate":"2020-07-18T00:00:00",
                    "day":"18",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00",
                    "exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"","total":"0:00","isAdded":false,"reportCode":""},
                {"id":87882,
                    "rdate":"2020-07-19T00:00:00",
                    "day":"19",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"א","entry":"0:00",
                    "exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"","total":"7:59","isAdded":false,"reportCode":""},
                {"id":87883,"rdate":"2020-07-19T00:00:00",
                    "day":"19",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"א","entry":"10:24",
                    "exit":"14:44",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"4:20","isAdded":false,"reportCode":""},
                {"id":87884,"rdate":"2020-07-19T00:00:00",
                    "day":"19",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"א","entry":"18:00",
                    "exit":"21:40",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"3:40","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87885,"rdate":"2020-07-20T00:00:00",
                    "day":"20",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ב","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87886,"rdate":"2020-07-21T00:00:00",
                    "day":"21",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ג",
                    "entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87887,"rdate":"2020-07-22T00:00:00",
                    "day":"22",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ד","entry":"11:06",
                    "exit":"20:51",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"9:45","isAdded":false,"reportCode":""},
                {"id":87888,"rdate":"2020-07-23T00:00:00",
                    "day":"23",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ה","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87889,"rdate":"2020-07-24T00:00:00",
                    "day":"24",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00",
                    "exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"0:00","isAdded":false,"reportCode":""},
                {"id":87890,"rdate":"2020-07-25T00:00:00",
                    "day":"25",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ש","entry":"0:00",
                    "exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"0:00","isAdded":false,"reportCode":""},
                {"id":87891,"rdate":"2020-07-26T00:00:00",
                    "day":"26",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"א","entry":"10:46",
                    "exit":"18:47",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "",
                    "userNotes":"","total":"8:01","isAdded":false,"reportCode":""},
                {"id":87892,"rdate":"2020-07-27T00:00:00",
                    "day":"27",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ב","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87893,"rdate":"2020-07-28T00:00:00",
                    "day":"28",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ג","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87894,"rdate":"2020-07-29T00:00:00",
                    "day":"29",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ד","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87895,"rdate":"2020-07-30T00:00:00",
                    "day":"30",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ה","entry":"10:30",
                    "exit":"18:30",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"8:00","isAdded":false,"reportCode":"ע.מהבית"},
                {"id":87896,"rdate":"2020-07-31T00:00:00",
                    "day":"31",
                    "stripId": 1,
                    "isWorkingDay":false,"dayOfWeek":"ו","entry":"0:00",
                    "exit":"0:00",
                    "requiredHours": "8:24",
                    "acceptedHours": "8:24",
                    "systemNotes": "","userNotes":"","total":"0:00","isAdded":false,"reportCode":""}
            ]})
    
    mock.onPost('incidents')
    .reply(200)

}
