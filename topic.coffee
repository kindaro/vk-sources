#!/usr/bin/env coffee

group =
    group_id: 2158488
    topic_id: 3207643

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

loop_over_comments = (corpus) ->
    console.log corpus.response.comments[0]

enter = vk_api_get 'board.getComments'
    , require('util')._extend(group, {offset: 0, count: 0})
    , loop_over_comments

