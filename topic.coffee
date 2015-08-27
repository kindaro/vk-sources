#!/usr/bin/env coffee

extend = require('util')._extend
XmlEntities = require('html-entities').XmlEntities
entities = new XmlEntities
url = require 'url'

# vk.com resources discussion topic.
# ----------------------------------
topic =
    group_id: 2158488
    topic_id: 3207643
    offset: 0
    count: 100

# Just some random rather short topic.
# ------------------------------------
# topic =
#     group_id: 96836518
#     topic_id: 32588806


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
    request (
        url.format
            protocol: 'https'
            hostname: 'api.vk.com'
            pathname: 'method/' + method
            query: args
        )
        , (error, response, body) ->
            if (!error && response.statusCode == 200)
                corpus = JSON.parse body
                if (corpus.error)
                    console.log corpus.error.error_msg
                else
                    callback corpus

loop_over_topic = (iterator, collection, condition) ->
    if condition iterator
        vk_api_get 'board.getComments', iterator, (corpus) ->
            loop_over_topic extend( iterator, { offset: iterator.offset + iterator.count } )
                , (collection.concat corpus.response.comments.slice(1))
                , condition
    else
        process_collection collection

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

enter = () -> 
    vk_api_get 'board.getComments', topic, (corpus) ->
        loop_over_topic topic, [], (iterator) -> iterator.offset < corpus.response.comments[0]

enter()

