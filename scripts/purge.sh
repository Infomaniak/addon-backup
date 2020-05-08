#!/bin/bash

set -x
set -e

host=$(hostname -a)
now=`date +%s`
time_limit=$(($now + 7200))
REPAIR=0

. /home/.config/swissbackup/openrc.sh

usage2() {  1>&2; exit 1; }

while getopts "s:h:d:w:m:y:" o; do
    case "${o}" in

        s)
            last_snapshot=${OPTARG}
            ;;


        h)
            hour=${OPTARG}
            ;;
        d)
            day=${OPTARG}
            ;;
        w)
            week=${OPTARG}
            ;;

        m)
            month=${OPTARG}
            ;;

        y)
            year=${OPTARG}
            ;;
    esac
done
shift $((OPTIND-1))

while true
    do
        now=`date +%s`
        if [[ $now -gt "$time_limit"  ]]
        then
            echo "`date +'%Y%m%d%H%M'`: Timeout. exiting "
            exit 1
        fi

        if [ $REPAIR -eq 1 ]
        then
        restic rebuild index
        break
        fi

        if [ `restic list locks --no-lock | wc -l` -gt 0 ]
        then
            echo "`date +'%Y%m%d%H%M'`: Backup waiting for lock" >> /tmp/retention.log
        else
            if  eval "/usr/bin/restic forget --host $host --keep-within "$year"y"$month"m"$day"d"$hour"h --prune" >> /tmp/retention.log; then
              break
            else

              if [ `restic list locks --no-lock | wc -l` -gt 0 ]
              then
                  echo "`date +'%Y%m%d%H%M'`: Command failed" >> /tmp/retention.log
                  continue
              fi
              if grep "conn.ObjectOpen: Object Not Found"
              then
                  echo "`date +'%Y%m%d%H%M'`: REPAIR MANDATORY" >> /tmp/retention.log
                  REPAIR=1
                  time_limit=$(($now + 17200))
                  continue
              fi
            fi
        fi
        sleep 60
done


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
                  res_clean=$(echo "[$res]" | sed 's/\(.*\),/\1 /')
                  now_date=`date +%s`
                  myplan="{\"last_update\": \"$now_date\", \"backup_plan\":$res_clean}"
                  echo $myplan >> /home/plan.json
                  }
         parse
