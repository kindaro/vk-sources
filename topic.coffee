#!/usr/bin/env coffee

extend      = require('util')._extend
XmlEntities = require('html-entities').XmlEntities
entities    = new XmlEntities
url         = require 'url'
esprima     = require 'esprima'
fs          = require 'fs'
async       = require 'async'
_           = require 'lodash'

# vk.com resources discussion topic.
# ----------------------------------
topic =
    param:
        group_id: 2158488
        topic_id: 3207643
        offset: 0
        count: 100
    value: []

isUrl = (line) ->
    p = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i
    p.test line
    # https://gist.github.com/searls/1033143

isJs = (line) ->
    p = /\.js$/
    p.test line

vk_api_get = (method, args, callback) ->
    request = require 'request'
    url = require 'url'
    request_constructor =
        url:
            url.format
                protocol: 'https'
                hostname: 'api.vk.com'
                pathname: 'method/' + method
                query: args
        timeout: 2000

    debugger

    request request_constructor
        , (error, response, body) ->
            if (!error && response.statusCode == 200)
                corpus = JSON.parse body
                if (corpus.error)
                    console.log corpus.error.error_msg
                else
                    callback corpus
            else
                if error
                    console.log 'error ' + error
                    vk_api_get method, args, callback
                else
                    console.log 'status ' + response.statusCode
                    vk_api_get method, args, callback

js_get = (my_url, callback) ->

    if !/^http/.test my_url
        my_url = 'https://' + my_url

    url = require 'url'
    my_path = (url.parse my_url) .path
    request = require 'request'
    request {url: my_url, timeout: 2000}, (error, response, body) ->
            if (!error && response.statusCode == 200)
                mk_path_and_write_data_to_a_file my_path, body, {prefix: 'topic.d'}, callback
            else
                if error
                    console.log 'file: ' + my_url + 'request error ' + error
                    js_get my_url, callback
                else
                    console.log 'file: ' + my_url + ' -- request status ' + response.statusCode

process_collection = (collection) ->
    i = 0
    s = collection
            .map (comment) -> comment.text
            .join(' ')
            .replace(/<br>/g, ' ')
            .split(' ')
            .map entities.decode
            .filter isUrl
            .filter isJs
            # .slice(1,10)
    l = s.length
    s .map (url) -> js_get url, () ->
        ++i

run = () ->
    vk_api_get 'board.getComments', topic.param, mkIter
    
mkIter = (corpus) ->
    topic.check = () -> this.param.offset < corpus.response.comments[0]
    topic.increment = (x) ->
        this.value = this.value.concat x.response.comments.slice(1)
        this.param.offset += this.param.count
        this
    topic.evaluate = () ->
        if this.check()
            vk_api_get 'board.getComments', this.param, (corpus) -> topic.increment(corpus).evaluate()
        else
            process_collection this.value
    topic.evaluate()

run()

mk_path_and_write_data_to_a_file = (path, contents, options, callback) ->

    path_parts = path.split '/'

    if options.absolute
        if path_parts[0] == ''
            path_absolute = true
            path_parts = path_parts.slice 1
    else
        if path_parts[0] == ''
            path_parts[0] = '.'

    if options.prefix
        path_parts = [options.prefix] .concat (path_parts)


    path_parents =
        path_parts
            .slice(0,-1)
            .reduce (ys, y, i, xs) ->
                    ys.push (xs.slice 0, i + 1) .join '/'
                    ys
                , []

    if path_absolute
        path_parents = path_parents .map (path) -> '/' + path

    async.each path_parents
        , (path_parent, callback) ->
            fs.exists path_parent, (flag) ->
                if flag
                    true
                    callback()
                else
                    debugger
                    console.log 'mkdir ', path_parent
                    fs.mkdir path_parent, () ->
                        console.log 'mkdir called back! '
                        callback()
        , () ->
            fs.writeFile (path_parts.join '/'), contents, callback


