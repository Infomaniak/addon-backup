#!/bin/bash

set -x
set -e

host=$(hostname -s)


crontab -u root -l | grep -v '/var/log/first-backup.log'  | crontab -u root -


. /home/.config/swissbackup/openrc.sh

eval "/usr/bin/restic backup --hostname $host --tag filesystem --one-file-system /"

function loopOverArray(){
         restic snapshots --json | jq -r '.?' | jq -c '.[]'| while read i; do
           id=$(echo "$i" | jq -r '.| .short_id')
           test=$(restic --no-lock stats $id | awk '{b=$3$4; print b}' |tail -1|sed 's/%$//g')
              size=$(echo $test)
              ctime=$(echo "$i" | jq -r '.| .time' | cut -f1 -d".")
                  paths=$(echo "$i" | jq -r '. | .paths | join(",")')
            hostname=$(echo $i | jq -r '.| .hostname')

       printf "{\"id\":%-s, \"date\":%-s, \"size\":%-s, \"path\":%-s, \"name\":%-s}," \"$id\" \"$ctime\" \"$size\" \"$paths\" \"$hostname\"

               done
              }
             function parse(){
                  local res=$(loopOverArray)
                  res_clean=$(echo "[$res]" | sed 's/\(.*\),/\1 /')
                  now=`date +%s`
                  myplan="{\"last_update\": \"$now\", \"backup_plan\":$res_clean}"
                  touch /home/plan.json
                  echo $myplan > /home/plan.json
                  }
         parse
