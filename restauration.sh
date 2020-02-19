#!/bin/bash

set -x
set -e

. /tmp/openrc.sh
restic restore $1 --target $2
