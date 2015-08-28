#!/usr/bin/env coffee

fs          = require 'fs'
async       = require 'async'
_           = require 'lodash'
js2coffee   = require 'js2coffee'
file        = require 'file'

convert_trees = (trees, callback) -> 
    async.each trees, (path, callback) ->
        file.walk path, (_null, dirPath, dirs, files) ->
            async.each files, (file, callback) ->
                if /\.js$/.test file
                    console.log 'file: ' + file
                    fs.readFile file, (err, data) ->
                        try
                            result = js2coffee.build data
                            if result
                                fs.writeFile (file + '.coffee'), result.code, (err) ->
                                    console.log 'written: ' + file + '.coffee'
                            callback()
                        catch error
                            console.log 'failed: ' + file
                            console.log error.description
                            callback()
                else
                    callback()
        callback()


convert_trees ['js', 'topic.d']
