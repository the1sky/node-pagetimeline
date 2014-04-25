#!/bin/sh
export PATH=$PATH:`pwd`
export PATH=$PATH:`pwd`/libs
export PATH=$PATH:`pwd`/bin
export PATH=$PATH:`pwd`/fonts
export PATH=$PATH:`pwd`/platforms
export PATH=$PATH:`pwd`/sqldrivers
echo $PATH
xvfb-run -a '--server-args=-screen 0 1280x720x16' `pwd`/bin/timeline "$@"

