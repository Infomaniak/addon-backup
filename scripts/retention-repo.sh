#!/bin/bash

set -x
set -e

host=$(hostname -s)


crontab -u root -l | grep -v '/var/log/first-backup.log'  | crontab -u root -

. /home/.config/swissbackup/openrc.sh

usage () {
        echo "$0 --folders-to-backup <folder1>[,folder2,folder3,...]"
        exit 1
}
for i in $@ ; do
        case "${1}" in
        "--folders-to-backup"|"-f")
        echo $1
                if [ -z "${2}" ] ; then
                        echo "No parameter defining the --folder-to-backup parameter"
                        usage
                fi
                FOLDER_TO_BACKUP="${2}"
                shift
                shift
        ;;
        *)
        ;;
        esac
done

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

FOLDERS_TO_BACKUP=$(echo ${FOLDER_TO_BACKUP} | tr -d  ' ' | tr  ',' ' ' )

for i in ${FOLDERS_TO_BACKUP}"" ; do


       eval "/usr/bin/restic backup --hostname $host --tag $i $i"
       
       

done

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
