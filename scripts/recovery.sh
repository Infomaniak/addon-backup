#!/bin/bash

set -x
set -e

#Apply credentials openrc

. /home/.config/swissbackup/openrc2.sh



usage () {

        echo "$0 --IDS-to-restore <ID1>[,ID2,ID3,...]"

        exit 1

}

for i in $@ ; do

        case "${1}" in

        "--IDS-to-restore"|"-i")

        echo $1

                if [ -z "${2}" ] ; then

                        echo "No parameter defining the --IDS-to-restore parameter"

                        usage

                fi

                IDS="${2}"

                shift

                shift

        ;;

        *)

        ;;

        esac

done

usage2() {  1>&2; exit 1; }

while getopts "d:" o; do

    case "${o}" in

        d)

            destination=${OPTARG}

        ;;

    esac

done
shift $((OPTIND-1))

TARGET_IDS=$(echo ${IDS} | tr -d  ' ' | tr  ',' ' ' )

# restic comamand for restoration ID

for i in ${TARGET_IDS}"" ; do



  restic="nohup restic snapshots $i "

  restic_cmd=$(eval "$restic")

  char='not'
  
  if [[ "$check" == *"$char"* ]]; then
  
        echo "id faux "
        exit 1

   else
        echo " cet id est bon "
        eval "restic restore $i --target $destination"
  fi


done
