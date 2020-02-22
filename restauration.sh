#!/bin/bash

set -x

set -e

#Apply credentials openrc

. /tmp/openrc.sh



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

  eval "restic restore $i --target $destination"

done
