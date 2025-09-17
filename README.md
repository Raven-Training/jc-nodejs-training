# typescript-kickoff-nodejs

Example base for typescript projects

## Table of contents

- [First steps](#first-steps)
  - [Installing node](#installing-node)
  - [Install dependencies](#install-dependencies)
  - [Starting your app](#starting-your-app)
- [Development](#development)
  - [Environments](#environments)
  - [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## First steps

### Installing node

Get the latest version of node from the [official website](https://nodejs.org/) or using [nvm](https://github.com/creationix/nvm)
Nvm approach is preferred.

### Install dependencies

Run `npm install` or `yarn` from rootpath of the project.

### Starting your app

Now, to start your app run `npm start` in the rootpath of the project. Then access your app at **localhost:port**, where the port was logged into the console at startup.

## Development

### Environments

By default, the environment will be **development**, but you can change it easily using the **NODE_ENV** environmental variable.

#### Environment variables

`Dotenv` is used for managing environment variables. They are stored in the `/.env` file. Take into account that the variables defined in the `bashrc` are not overrided.

The environment variables should be added to the `.env` file in the form of `NAME=VALUE`, as the following example:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=myuser
DB_PASSWORD=mypassword
DB_NAME=mydb
```

**Remember not to push nor commit the `.env` file.**

### Testing

To run your tests you first need to config your testing database by setting the env var `DB_NAME_TEST`. as explained
before in [Database configuration](#database-configuration). Also you need to run the migrations in this exclusive
testing database each time you have new ones, you can do this by running the command `npm run migrations-test`.
Once you have all the above done you can run your tests with the following command: `npm test`. For more information refeer to the documentation of [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/).

### Documentation

Documentation will be served at `/docs`. Remember using [dictum.js](http://www.github.com/Wolox/dictum.js) package to automatically generate documentation for your endpoints. Check [this link](https://github.com/Wolox/dictum.js#chai) for further details.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Run the tests (`npm test`)
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create new Pull Request

## License

**typescript-kickoff-nodejs** is available under the MIT [license](LICENSE.md).

    Copyright © 2025 Raven

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the “Software”), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
