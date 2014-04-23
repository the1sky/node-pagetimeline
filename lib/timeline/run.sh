#!/bin/sh
export LD_LIBRARY_PATH=`pwd`/libs
export QT_QPA_FONTDIR=`pwd`/fonts
xvfb-run -a '--server-args=-screen 0 1280x720x16' ./timeline "$@"

