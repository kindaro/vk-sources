#!/usr/bin/env coffee

request = require 'request'

request 'https://api.vk.com/method/board.getComments' +
        '?group_id=2158488'                           +
        '&topic_id=3207643'                           +
        '&offset=0'                                   +
        '&count=0' ,
    (error, response, body) ->
        if (!error && response.statusCode == 200)
            corpus = JSON.parse body
            if (corpus.error)
                console.log corpus.error.error_msg
            else
                console.log corpus.response.comments[0]

