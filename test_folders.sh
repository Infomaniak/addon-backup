#!/bin/bash


touch /tmp/fails-folders
touch /tmp/goods-folders
> /tmp/fails-folders
> /tmp/goods-folders
test=$(echo $1 | tr  ',' ' ' )
for i in ${test}"" ; do
    if [ -n "$(ls -A $i 2>/dev/null)" ];
        then
            eval "echo -e "$i" >> /tmp/goods-folders";
          else
            > /tmp/log
            eval "echo -e "je passe par la fdp de mort" >> /tmp/log";
            for p in ${test}"" ; do
              if [ ! -n "$(ls -A $p 2>/dev/null)" ];
                then
                  eval "echo -e "$p" >> /tmp/fails-folders"
              fi
            done
                exit 1
      fi
done
