# HavanaClients

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![dependencies Status](https://david-dm.org/Tel-Aviv/HavanaClients/status.svg)](https://david-dm.org/Tel-Aviv/HavanaClients)
[![devDependency Status](https://david-dm.org/Tel-Aviv/HavanaClients/dev-status.svg)](https://david-dm.org//Tel-Aviv/HavanaClients#info=devDependencies)
[![Build Status](https://travis-ci.org/Tel-Aviv/HavanaClients.svg?branch=master)](https://travis-ci.org/Tel-Aviv/HavanaClients)


This is [yarn-workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) monorepo divided into several packages for a different clients of Havana REST API:
1. Web, build with React
2. Mobile, build with React Native
3. Responsive Web, adapted from RN with [React Native Web](https://github.com/necolas/react-native-web)

## Root scripts
You may run each client independently with root scripts:
1. **yarn web:test** - runs Jest suites for Web-client. May be mocked in *setEnvVars.js* file. When mocked, uses the predefined responses in *utils.js*. This invocation may be very time consumable.
2. **yarn web:start** - launches *webpack serve* (previously webpack-dev-server) with Web client (Chrome, Safari, Edge and IE11 browsers are supported). This client uses .env file that is also published in the repository. This file does not contain the sensitive info but used to mock API when Web client is tested outside of the enterprise network. In such a case, ensure .env file contains *mock=true* line that activates mocks for axios calls.
3. **yarn web-m:start** - launches webpack-dev-server with Responsive Web Client (use Developer Tools for toggle the device in advance)
4. **yarn mobile:start:ios** - (only on Mac) launches iOS Simulator for externally published thru [Azure APIM Hanava REST API](https://apiportal.tel-aviv.gov.il/docs/services/presenceserver/operations/daysoff)
4. **yarn mobile:android** - starts Android Emulator for the client against Azure APIM published API

## The root scripts used to create production bundles
1. **yarn web:build** - creates bundle.js and copies it to the desired http server. Use *publish_destination=xxx* in .env file to designate the target http server directory. We assume the corresponding HTML file contains the script link to 'bundle.js'
2. **yarn web-m:build** - creates 'mobile.bundle.js' and copies it to folder specified in .env file *publish_destination=xxx*
The root API is able to detect the User-Agent and return and HTML with the script linked to 'mobile.bundle.js'
3. **yarn:build** - creates both Web and Responsive Web clients [concurrently](https://www.npmjs.com/package/concurrently) and copies both to directory specified in .env file by *publish_destination=xxx*

## Run in Container (only for Web client)
As a prerequisite for this step install [Docker Desktop](http://docker.com/products/docker-desktop).
1. Build an image for Web:

    cd ./packages/havana-web
    docker build -t havan:web .

    or

    docker build -f Dockerfile.dev -t havana:web .

    Inspect the "Images" tab in Docker Destop to see havana image taggeg as 'web'
    
2. Run the image as a container

    docker run -it -p 8080:80 havana:web

3. (Optioanlly) Push the image to Docker Hub

    3.1. Login to your docker hub account on terminal: docker login --username=olegkleiman

    3.2. run docker images and note the IMAGE ID for 'havana'

    3.3. tag the image: docker tag <IMAGEID> olegkleiman/havana:web

    3.4. docker push olegkleiman/havana:web

4. Then browse to http://localhost:8080
