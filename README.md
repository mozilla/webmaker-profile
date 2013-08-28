# Webmaker Profile

Prototype of *USERNAME.makes.org* profile.

## Build Dependencies

- npm
- grunt CLI `npm install -g grunt-cli`
- bower `npm install -g bower`

## Setup

```bash
git clone https://github.com/gvn/webmaker-profile.git
npm install
```

## Grunt Tasks

- **grunt** - Recompile Jade and Less as needed for dev. Run a server at [localhost:8000](http://localhost:8000).
- **grunt build** - Compile Jade, Less and JS for production and run JSHint.

## Indexes

There are two index HTML files that are generated from `index.jade`. For development you'll use `index.dev.html`, which has uncompiled JS for easier debugging. It also uses a version of the compiled LESS that has inline source annotations for debugging purposes.

The other index, `index.html`, is used for the production version of the app. It includes concatenated and minified versions of the app's JS and CSS.

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
