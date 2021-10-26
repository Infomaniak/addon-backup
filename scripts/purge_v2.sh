#!/bin/bash

set -x
set -e

id=$(restic forget -n --host  node50252-env-0519885 --keep-last 18 --json | jq -r '.?' | jq -c '.[].remove[]?' | jq -r '.| .short_id' > /home/delete_id)
id_del=$($id | awk 'BEGIN { ORS="" } { print p"\042"$0"\042"; p=", " }' /home/delete_id)
echo $id
echo $id_del
if cat /home/plan.json | jq "del(.backup_plan[] | select(.id == ($id_del)))"; then
echo $(cat /home/plan.json | jq "del(.backup_plan[] | select(.id == ($id_del)))") > /home/machallah
else
echo "ca na pas marche"
fi

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

#parsing backup plan

id=$(restic forget -n --host $host --keep-within "${year}y${month}m${day}d${hour}h" --json | jq -r '.?' | jq -c '.[].remove[]?' | jq -r '.| .short_id' | tee /home/delete_id)

id_del=$($id | awk 'BEGIN { ORS="" } { print p"\042"$0"\042"; p=", " }' /home/delete_id)

if cat /home/plan.json | jq "del(.backup_plan[] | select(.id == ($id_del)))"; then
  echo $(cat /home/plan.json | jq "del(.backup_plan[] | select(.id == ($id_del)))") > /home/plan.json
else
  echo "problem found" >> /tmp/parse.log
fi
