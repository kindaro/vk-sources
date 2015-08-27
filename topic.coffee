#!/usr/bin/env coffee

extend = require('util')._extend
XmlEntities = require('html-entities').XmlEntities
entities = new XmlEntities
url = require 'url'
esprima = require 'esprima'
fs = require 'fs'


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
    console.log request_constructor

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

mkdirp = (path, callback) ->
    path_parts = path.split '/'
                        .slice(1,-1)
                        .reduce (ys, y, i, xs) ->
                            ys.push (xs.slice 0, i + 1) .join '/'
                            ys
                        , []
    f = (list_of_paths) ->
        if list_of_paths.length > 0
            p = list_of_paths[0]
            ps = list_of_paths.slice(1)
            fs.stat p, (err, stats) ->
                if err
                    console.log p
                    # fs.mkdir p
            f ps
        else
            callback()

    f path_parts

js_get = (my_url, callback) ->

    if !/^http/.test my_url
        my_url = 'https://' + my_url

    url = require 'url'
    my_path = (url.parse my_url) .path
    request = require 'request'
    request {url: my_url, timeout: 2000}, (error, response, body) ->
            if (!error && response.statusCode == 200)
                # try
                #     corpus = esprima.parse body # this is where we fail
                # catch error
                #     console.log error
                mkdirp my_path, () ->
                    fs.writeFile './' + my_path
                        , body
                        , (err) ->
                            if err
                                throw err
                            console.log 'written ' + my_path
            else
                if error
                    console.log 'request error ' + error
                    js_get my_url, callback
                else
                    console.log 'request status ' + response.statusCode
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
        if i = l
            console.log 'done!'




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


