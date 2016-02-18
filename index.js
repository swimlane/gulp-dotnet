'use strict';

var gutil = require('gulp-util');
var proc = require('child_process');
var notifier = require('node-notifier');

const logLevels = {
  DEBUG: 1,
  INFO: 2,
  ERROR: 3,
  SILENT: 4
};

const defaults = {
  
  // working directory
  cwd: './',
  
  // how noisy?
  logLevel: logLevels.DEBUG,
  
  // default task to launch
  // not hooked up atm
  task: 'web',
  
  // notify on errors
  notify: true
  
};

function assignDefaults(opts){
  opts = opts || {};
  // could be remove if Node supported
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    for(let opt in defaults){
    if(!opts.hasOwnProperty(opt)){
      opts[opt] = defaults[opt];
    }
  }
  return opts;
}

class DNX {
  
  static start(task, opts, cb){
    opts = assignDefaults(opts);
    return new DNX(opts).start(task, cb);
  }
  
  static build(opts, cb){
    opts = assignDefaults(opts);
    return new DNX(opts).build(cb);
  }
  
  static update(opts){
    opts = assignDefaults(opts);
    return new DNX(opts).update(cb);
  }

  constructor(opts){
    this.options = assignDefaults(opts);
  }
  
  log(level, msg, data){
    if(level <= this.options.logLevel){
      let color = level === logLevels.ERROR ?
        gutil.colors.red : gutil.colors.blue;
        
      msg = `${ color('DNX') }: ${msg}`;
      
      if(data)  { 
        gutil.log(msg, data);
      } else {
       gutil.log(msg);
      }
    } 
  }
  
  notify(msg){
    if(this.options.notify){
      notifier.notify({
        sound: true,
        message: 'DNX Notification',
        title: msg
      });
    }
  }
  
  start(task, done){
    // only do first time
    if(!this.child){
      process.on('exit', this.kill);
    }
    
    if (this.child) {
      this.log(logLevels.INFO, 'Restarting');
      this.child.kill();
    }
    
    if(this.starting) {
      this.log(logLevels.ERROR, 'Tried to start multiple instances while still starting!');
      this.notify('Tried to start multiple instances while still starting!');
      return;
    }
      
    this.starting = true;
    this.child = proc.spawn('dnx', [task], {
      cwd: this.options.cwd
    });
    
    this.child.stdout.on('data', (data) => {
        this.log(logLevels.DEBUG, data);
        
        // kinda hacky but want to know when this started to call done() for gulp
        if(!this.started && data.indexOf('Application started') > -1){
          this.log(logLevels.INFO, data);
          this.starting = false;
          this.started = true;
          done && done();
        }
    });

    this.child.stderr.on('data', (data) => {
      this.log(logLevels.ERROR, data);
      this.starting = false;
    });

    this.child.on('close', (code) => {
      if (code === 8) {
        this.log(logLevels.ERROR, `Error Ocurred!`);
        this.notify('Error Ocurred!');
      } else {
        this.log(logLevels.DEBUG, ` Exiting...`);
      }
      
      this.started = false;
      this.starting = false;
    });
  }
  
  kill(){
    if (this.child) {
      this.started = false;
      this.starting = false;
      DNX.instance.child.kill();
    }
  }
  
  build(done){
    proc.exec('dnu build', {
      cwd: this.options.cwd 
    }, (err, stdout, stderr) => {
      if (err) {
        this.log(logLevels.ERROR, `Build Failed`, err);
        this.notify('Build Failed');
      } else {
        this.log(logLevels.DEBUG, stdout);
      }
      done && done();
    });
  }
  
  update(done){
    proc.exec('dnu restore', {
      cwd: this.options.cwd 
    }, (err, stdout, stderr) => {
      if (err) {
        this.log(logLevels.ERROR, `Restore Error`, err);
        this.notify('Restore Failed');
      } else {
        this.log(logLevels.DEBUG, stdout);
      }
      done && done();
    });
  }
  
}

module.exports = DNX;