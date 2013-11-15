[![Build Status](https://travis-ci.org/mozilla/webmaker-profile.png)](https://travis-ci.org/mozilla/webmaker-profile)
[![Dependency Status](https://gemnasium.com/mozilla/webmaker-profile.png)](https://gemnasium.com/mozilla/webmaker-profile)

# Webmaker Profile

**USERNAME.makes.org**

## Build Dependencies

- npm
- grunt CLI `npm install -g grunt-cli`
- bower `npm install -g bower`

## Setup

### Application Setup

```bash
git clone https://github.com/mozilla/webmaker-profile.git
cd webmaker-profile && npm install
```

### Service Setup

Profile uses a web service for its backend. 

To run the service locally:

1. Clone [webmaker-profile-service](https://github.com/mozilla/webmaker-profile-service) into a new location (most likely parallel to **webmaker-profile**)
2. `cd` into the `webmaker-profile-service` directory
3. Run `node app.js`

## Grunt Tasks

- **grunt** - Recompiles Jade and Less as needed for dev. Runs a server at [localhost:8000](http://localhost:8000).
- **grunt build** - Compiles Jade, Less and JS for production and run JSHint.
- **grunt clean** - Runs JSHint and beautifies JS to comply with our [contribution guidelines](https://github.com/mozilla/webmaker-profile/blob/master/CONTRIBUTING.md).

## Indexes

There are two index HTML files that are generated from `index.jade`. For development you'll generally run `index.dev.html`, which has uncompiled JS for easier debugging. It also uses a version of the compiled LESS that has inline source annotations for debugging purposes.

The other index, `index.html`, is used for the production version of the app. It includes concatenated and minified versions of the app's JS and CSS.

## Localization

[https://github.com/mozilla/webmaker-profile/wiki/Localization](https://github.com/mozilla/webmaker-profile/wiki/Localization)

## Deploy to Heroku

Use the nodejs-grunt buildpack:
```bash
heroku create {yourname-profile} --buildpack https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt
git push heroku master
```
You can always set the buildpack config variable separately:
```bash
heroku config:add BUILDPACK_URL=https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git
```
If you want to push up a branch other than master
```bash
git push heroku branchname:master
```
