#!/bin/bash

host=$(hostname -s)

if type apt 2>/dev/null ; then
	apt-get install -y curl
  curl -d "email=$1&container=$host" -X POST http://jelastic-addon-swissbackup.infomaniak.ch:8080/user
	echo "curl installed on debian"
else
	detect=$(cat /etc/*-release | grep 'ID=')
	if [[ $detect == *"centos"* ]]; then
		yum install curl
    curl -d "email=$1&container=$host" -X POST http://jelastic-addon-swissbackup.infomaniak.ch:8080/user
		echo "curl installed on centos"
	elif [[ $detect == *"alpine"* ]]; then
		apk add curl
		echo "curl installed on alpine"
    curl -d "email=$1&container=$host" -X POST http://jelastic-addon-swissbackup.infomaniak.ch:8080/user

	fi
fi
