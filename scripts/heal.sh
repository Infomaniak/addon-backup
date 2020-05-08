#!/bin/bash

set -x
set -e

. /home/.config/swissbackup/openrc.sh

restic unlock
