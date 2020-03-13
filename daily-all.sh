#!/bin/bash

set -x
set -e

crontab -u root -l | grep -v '/var/log/first-backup.log'  | crontab -u root -

. /root/.config/swissbackup/openrc.sh

eval "/usr/bin/restic backup --tag filesystem --one-file-system /"


sleep 5

restic unlock

eval "/usr/bin/restic forget --tag filesystem --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --keep-yearly 3 --prune"


> /root/.config/swissbackup/Backups_plan

/usr/bin/restic snapshots --no-lock > /root/.config/swissbackup/Backups_plan
