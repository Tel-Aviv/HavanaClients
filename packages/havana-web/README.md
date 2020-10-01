# HavanaClients

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## Build configuration
If your intentions are to use webpack-dev-server from localhost, provide the public path from which the app would be served in .env file. That value will be copied to webpack.config.js before the building. Usually set *public_path = /* there.

If you want the app to be hosted on another http server (likely IIS), provide the desired virtual directory in this entry, say *public_path = /ps/*. Thus, (after deploying) it will be served from *http://<host_name>/ps/*.
In other words, take in mind that webpack inserts the output.publicPath value into the created bundle.