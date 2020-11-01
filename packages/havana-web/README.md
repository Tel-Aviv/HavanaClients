# HavanaClients

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Build configuration
If your intentions are to use webpack-dev-server from localhost, provide the public path from which the app would be served in .env file. That value will be copied to webpack.config.js before the building. Usually set *public_path = /* there.

If you want the app to be hosted on another http server (likely IIS), provide the desired virtual directory in this entry, say *public_path = /ps/*. Thus, (after deploying) it will be served from *http://<host_name>/ps/*.
In other words, take in mind that webpack inserts the output.publicPath value into the created bundle.

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
