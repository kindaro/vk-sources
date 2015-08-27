#!/bin/sh -e

wget                               \
    --recursive                    \
    --level=1                      \
    --page-requisites              \
    'https://vk.com/ignat_insarov'

mv -v 'vk.com/js' .

rm -rfv 'vk.com'

find                                \
    './js'                          \
    -type f                         \
    -exec "${0%/*}/cut.sh" '{}' ';'

