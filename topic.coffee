#!/usr/bin/env coffee

extend = require('util')._extend
XmlEntities = require('html-entities').XmlEntities
entities = new XmlEntities
url = require 'url'

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

process_collection = (collection) ->
    v = collection
        .map (comment) -> comment.text
        .join(' ')
        .replace(/<br>/g, ' ')
        .split(' ')
        .map entities.decode
        .filter isUrl
        .filter isJs
    console.log v

mkIterator = (callback) ->
    vk_api_get 'board.getComments', topic.param, (corpus) ->
        topic.check = () -> this.param.offset < corpus.response.comments[0]
        topic.increment = (x) ->
            this.value = this.value.concat x.response.comments.slice(1)
            this.param.offset += this.param.count
            this
        topic.evaluate = () ->
            if this.check()
                console.log 'state: ' + this.param.offset, this.check()
                vk_api_get 'board.getComments', this.param, (corpus) -> topic.increment(corpus).evaluate()
            else
                console.log this.param.offset, this.check()
                callback this.value
        topic.evaluate()

mkIterator(process_collection)
