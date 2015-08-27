#!/bin/sh -e

cut () {
	mv -v "$1" "${1%\?*}"
}

cut "$1"
