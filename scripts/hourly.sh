#!/bin/bash

set -x
set -e

host=$(hostname -a)


crontab -u root -l | grep -v '/var/log/first-backup.log'  | crontab -u root -

touch /home/plan.json

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

FOLDERS_TO_BACKUP=$(echo ${FOLDER_TO_BACKUP} | tr -d  ' ' | tr  ',' ' ' )

for i in ${FOLDERS_TO_BACKUP}"" ; do
       
       if ! eval "/usr/bin/restic backup --hostname $host --tag $i $i"; then
       
                restic unlock
       fi

done

for p in ${FOLDERS_TO_BACKUP}"" ; do

        sleep 5

       if ! eval "/usr/bin/restic forget --tag $p --keep-hourly 24 --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --keep-yearly 3 --prune"; then
                
                restic unlock
                
                restic rebuild-index
       fi

done

> /home/plan.json

function loopOverArray(){

         restic snapshots --json | jq -r '.?' | jq -c '.[]'| while read i; do
         id=$(echo "$i" | jq -r '.| .short_id')
         ctime=$(echo "$i" | jq -r '.| .time' | cut -f1 -d".")
         paths=$(echo "$i" | jq -r '. | .paths | join(",")')

        printf "id: %-15s - %-25s - paths: %-10s \n" $id $ctime $paths >> /home/plan.json

done
  }

   loopOverArray
