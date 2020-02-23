#!/bin/bash
set -x
set -e


. /tmp/openrc.sh

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

eval "/usr/bin/restic backup --tag $i $i"

eval "/usr/bin/restic forget --tag $i --keep-hourly 24 --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --keep-yearly 3 --prune"

done
echo " last = ${last_snapshot}"
echo " year = ${year}"


> /tmp/Backups_plan

/usr/bin/restic snapshots > /tmp/Backups_plan
