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
