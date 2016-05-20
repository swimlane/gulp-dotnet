# DOTNET Core Gulp Plugin [![Dependency Status](https://david-dm.org/Swimlane/gulp-dotnet.svg)](https://david-dm.org/Swimlane/gulp-dotnet) [![devDependency Status](https://david-dm.org/Swimlane/gulp-dotnet/dev-status.svg)](https://david-dm.org/Swimlane/gulp-dotnet#info=devDependencies)

GulpJS plugin for DOTNET CORE CLI ( ASP.NET Core ) that is cross-platform. This plugin does the following:

- Build
- Update
- Start

and with Gulp you can setup watchers for recompiling on the fly and restarting the web server. Similar to [gulp-dnx](https://github.com/tugberkugurlu/gulp-dnx) but this one has more logging opts, notifications and is cross platform.

## Usage

__build.js__
```
var gulp = require('gulp');
var Dotnet = require('gulp-dotnet');
gulp.task('build:csharp', function(cb) {
  Dotnet.build({ cwd: './' }, cb);
});
```

__watch.js__
```
var gulp = require('gulp');
var runSequence = require('run-sequence');
var paths = './**/*.cs';

function changed(event) {
  gutil.log(`File ${event.path} was ${event.type}, running tasks...`);
};

gulp.task('watch', ['build'], function() {
  gulp.watch(paths, {interval: 500}, function(){
    runSequence('build:csharp', 'start:api');
  }).on('change', changed);
});
```

__server.js__
```
var gulp = require('gulp');
var Dotnet = require('gulp-dotnet');

var server;
gulp.task('start:api', function(cb) {
  if(!server) server = new Dotnet({ cwd: paths.api  });
  server.start('weblistener', cb);
});
```

## Options

```
{
  // current working directory
  cwd: './',
  
  // how noisy?
  // options: 'debug', 'info', 'error', 'silent'
  logLevel: 'debug',
  
  // notify on errors
  notify: true
}

```

## Credits

`gulp-dotnet` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.

## License
MIT
