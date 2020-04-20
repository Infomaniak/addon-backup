#!/bin/bash

set -x
set -e

host=$(hostname -a)


crontab -u root -l | grep -v '/var/log/first-backup.log'  | crontab -u root -

touch /home/plan.json

. /home/.config/swissbackup/openrc.sh

restic unlock

if ! eval "/usr/bin/restic backup --hostname $host --tag filesystem --one-file-system /"; then

         restic unlock
fi

sleep 5

if ! eval "/usr/bin/restic forget --tag filesystem --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --keep-yearly 3 --prune"; then
         restic unlock
         
         restic rebuild-index
fi

> /home/plan.json

function loopOverArray(){
         restic snapshots --json | jq -r '.?' | jq -c '.[]'| while read i; do
           id=$(echo "$i" | jq -r '.| .short_id')
              ctime=$(echo "$i" | jq -r '.| .time' | cut -f1 -d".")
                  paths=$(echo "$i" | jq -r '. | .paths | join(",")')
            hostname=$(echo $i | jq -r '.| .hostname')
                                                      
       printf "{\"id\":%-s, \"date\":%-s, \"path\":%-s, \"name\":%-s}," \"$id\" \"$ctime\" \"$paths\" \"$hostname\"
     
               done
              }
             function parse(){
              local res=$(loopOverArray)
       echo "[$res]" | sed 's/\(.*\),/\1 /' >> /home/plan.json
          }
         parse

