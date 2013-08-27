# Webmaker Profile

Prototype of *USERNAME.makes.org* profile.

## Build Dependencies

- npm
- grunt CLI `npm install -g grunt-cli`
- bower `npm install -g bower`

## Installation

```bash
git clone https://github.com/gvn/webmaker-profile.git
npm install
```

### Bower

Currently you may have to run `bower install` after `npm install`.

## Grunt Tasks

- **grunt** - Recompile Jade and Less as needed for dev. Run a server at [localhost:8000](http://localhost:8000).
- **grunt build** - Compile Jade, Less and JS for production.

## Staging

[http://wm-profile.herokuapp.com/](http://wm-profile.herokuapp.com/)

## Deploy to heroku
Use the nodejs-grunt buildpack:
```
heroku create {yourname-profile} --buildpack https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt
git push heroku master
```
You can always set the buildpack config variable separately:
```
heroku config:add BUILDPACK_URL=https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git
```
If you want to push up a branch other than master
```
git push heroku branchname:master
```
