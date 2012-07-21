#!/usr/bin/env node
// Generated by CoffeeScript 1.3.3
(function() {
  var ArgumentParser, addFiles, args, fs, parser, path, ravendb, saveApp, version;

  fs = require('fs');

  path = require('path');

  ravendb = require('ravendb');

  ArgumentParser = require('argparse').ArgumentParser;

  version = '0.0.3';

  addFiles = function(appName, appDir, rootDir, db, callback) {
    return fs.readdir(rootDir, function(err, files) {
      return files.forEach(function(filename) {
        filename = "" + rootDir + "/" + filename;
        return fs.stat(filename, function(err, stat) {
          var appRoot, docId;
          if (err != null) {
            callback(err);
            return;
          }
          if (stat.isDirectory()) {
            return addFiles(appName, appDir, filename, db, function(err, resp) {
              if (err != null) {
                callback(err);
              } else {
                console.log("Added files for " + filename);
                return callback(null, resp);
              }
            });
          } else {
            appRoot = "apps/" + appName;
            docId = appRoot.replace(appDir, '');
            docId += filename.replace(appDir, '');
            return db.deleteAttachment(docId, function(err, resp) {
              return db.saveAttachment(docId, fs.createReadStream(filename), function(err, result) {
                if (err != null) {
                  callback(err);
                } else {
                  console.log("Saved \"" + filename + "\" to \"" + docId + "\"");
                  return callback(null, result);
                }
              });
            });
          }
        });
      });
    });
  };

  saveApp = function(args, cb) {
    var appDir, appName, db, dbName, dbUrl, ravenHqApiKey;
    appDir = args.directory;
    appName = args.name;
    dbUrl = args.store;
    dbName = args.database;
    ravenHqApiKey = args.apiKey;
    appDir = appDir[appDir.length - 1] === '/' ? appDir.substring(0, appDir.length - 1) : appDir;
    db = ravendb(dbUrl, dbName);
    if (/ravenhq\.com/.test(dbUrl) && ravenHqApiKey) {
      return db.useRavenHq(ravenHqApiKey, function(err, auth) {
        return addFiles(appName, appDir, appDir, db, function(e, r) {
          if (e != null) {
            console.log("Error in saveApp: " + e);
          } else {
            console.log("Finished saving app: " + r);
          }
          return cb(e, r);
        });
      });
    } else {
      return addFiles(appName, appDir, appDir, db, function(e, r) {
        if (typeof e === "function" ? e(console.log("Error in saveApp: " + e)) : void 0) {

        } else {
          console.log("Finished saving app: " + r);
        }
        return cb(e, r);
      });
    }
  };

  parser = new ArgumentParser({
    'version': version,
    addHelp: true,
    description: 'RavenApp builder'
  });

  parser.addArgument(['-d', '--directory'], {
    help: 'base directory for the RavenApp',
    dest: 'directory',
    required: true
  });

  parser.addArgument(['-n', '--name'], {
    help: 'the name of the RavenApp',
    dest: 'name',
    required: true
  });

  parser.addArgument(['-s', '--store'], {
    help: 'specify which data store to use (defaults to http://localhost:8080 if not specfied)',
    defaultValue: 'http://localhost:8080',
    dest: 'store'
  });

  parser.addArgument(['-db', '--database'], {
    help: 'specify which database to use (defaults to "Default" if not specified)',
    defaultValue: 'Default',
    dest: 'database'
  });

  parser.addArgument(['-key', '--apikey'], {
    help: 'specity the api key to use with RavenHQ databases',
    defaultValue: null,
    dest: 'apiKey'
  });

  args = parser.parseArgs();

  saveApp(args, function(err, resp) {
    if (typeof err === "function" ? err(console.log(err)) : void 0) {

    } else {
      console.log(resp);
      return console.log('Done.');
    }
  });

}).call(this);
