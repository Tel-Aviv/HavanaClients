# HavanaClients

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)


This is yarn-workspaces monorepo divided into several packages for a different client of Havana REST API
1. Web, build with React
2. Mobile, build with React Native
3. Responsive Web, adapted from RN with [React Native Web](https://github.com/necolas/react-native-web)

## Root scripts
You may run each client independently with root scripts
1. yarn web:start - launches webpack-dev-server with Web client (Chrome, Edge and IE11 browsers are supported). This client uses .env file that is also published in the repository. This file does not contain the sensitive info but used to mock API when Web client is tested outside of the enterprise network. In such a case, ensure .env file contains 
```
mock=true 
```
line that activates mocks for axios calls.

2. yarn web-m:start - launches webpack-dev-server with Responsive Web Client (use Developer Tools for toggle the device in advance)

3. yarn mobile:start:ios - (only on Mac) launches iOS Simulator for externally published thru [Azure APIM Hanava REST API](https://apiportal.tel-aviv.gov.il/docs/services/presenceserver/operations/daysoff)

4. yarn mobile:android - starts Android Emulator for the client against Azure APIM published API

The root scripts used to create production bundles
1. yarn web:build - creates bundle.js and copies it to the desired http server. Use 
```
publish_destination=xxx
```
in .env file to designate the target http server directory. We assume the corresponding HTML file contains the script link to 'bundle.js'
2. yarn web-m:build - creates 'mobile.bundle.js' and copies it to specified 
```
publish_destination=xxx
```
The root API is able to detect the User-Agent and return and HTML with the script linked to 'mobile.bundle.js'
3. yarn:build - creates both Web and Responsive Web clients [concurrently](https://www.npmjs.com/package/concurrently) and copies both to [code](publish_destination=xxx)

