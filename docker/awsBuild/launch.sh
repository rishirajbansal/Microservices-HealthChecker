#!/usr/bin/env bash

#set -x #echo on

######################################################################################
## This script 'launches' Health Checker application simulating PROD Docker based environment.
## 
## ● This script is primarily built for development testings.
## 
## PREREQUISITES for launching this stack:
## 1. Docker Installed
## 
## CONFIGURATION
## 1. Update build settings in .conf file based on the requirements
## 2. Provide execution permissions to script: chmod u+x launch.sh
##
## !! This script is executed from local terminal. !!
## 
## ^^^^^^^^^^^^^ USAGE ^^^^^^^^^^^^^
##
## $ ./launch.sh
##
## ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
##
######################################################################################

curr_dir=
errCol=`tput setaf 1`
succCol=`tput setaf 2`
reset=`tput sgr0`

# Determine the OS Type
osName="$(uname -s)"
case "${osName}" in
    Linux*)     curr_dir=$( dirname "$(readlink -f -- "$0")" );;
    Darwin*)    curr_dir=$(pwd);;
    *)          curr_dir=$( dirname "$(readlink -f -- "$0")" )
esac

echo 

getConfig(){
    echo | grep ^$1= $curr_dir/.conf | cut -d'=' -f2
}


## Constants


#Get Configured Properties
AWS_ACCOUNT_ID=$(getConfig 'AWS_ACCOUNT_ID')
AWS_PROFILE=$(getConfig 'AWS_PROFILE_NAME')
AWS_REGION=$(getConfig 'AWS_REGION')
APP_CONTAINER_NAME=$(getConfig 'APP_CONTAINER_NAME')
APP_HOST=$(getConfig 'APP_HOST')
APP_PORT=$(getConfig 'APP_PORT')
DOCKER_USERNAME=$(getConfig 'DOCKER_USERNAME')
DOCKER_USERNAME_PWD=$(getConfig 'DOCKER_USERNAME_PWD')
APP_RUN_OPTION=$(getConfig 'APP_RUN_OPTION')
APP_NAME=$(getConfig 'APP_NAME')
NPM_CONFIG_LOGLEVEL=$(getConfig 'NPM_CONFIG_LOGLEVEL')
NODE_ENV=$(getConfig 'NODE_ENV')
APP_ENV=$(getConfig 'APP_ENV')

BASE_IMAGE=$(getConfig 'BASE_IMAGE')

## Local variables


echo -e "\n===================================================================="
echo "'Health Checker' Application Launcher Setup started in PROD setup Mode [For Development Testings]..." 
echo "===================================================================="

echo -e "\n----------------------------------------------------"
echo "AWS Profile:              $AWS_PROFILE"            
echo "AWS Region:               $AWS_REGION"
echo -e "\n----------------------------------------------------"


cd ${curr_dir}/../../

#1. Build the app - this will compile .ts files into .js and save to build folder
echo && echo "Building app files..."
npm run build > build.out 2>&1 || true
cat build.out
if cat build.out | grep -q "npm ERR!" || cat build.out | grep -q "Failed to compile"
then
    echo -e "\n=> Application build failed, program will be terminated...\n"
    exit 1;
fi
rm -rf build.out

#2. Launch Application
CONTAINER_RUNNING="$(docker ps --quiet --filter=name="${APP_CONTAINER_NAME}")"
CONTAINER_EXISTS="$(docker container ls --all --quiet --filter=name="${APP_CONTAINER_NAME}")"

aws ecr get-login-password --region ${AWS_REGION} --profile ${AWS_PROFILE} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

if [ -n "$CONTAINER_EXISTS" ] || [ -n "$CONTAINER_RUNNING" ]
then
    echo && echo "Previously existing container found, Stopping and Removing '${APP_CONTAINER_NAME}' container..."

    if [ -n "$CONTAINER_RUNNING" ]; then
        docker container stop ${APP_CONTAINER_NAME}
        echo "${APP_CONTAINER_NAME} Stopped."
    fi

    docker container rm --force ${APP_CONTAINER_NAME}
    echo "${APP_CONTAINER_NAME} Removed."
else
    echo && echo "Docker container '${APP_CONTAINER_NAME}' NOT found running or existing."
fi

image=$(echo ${APP_NAME} | tr [:upper:] [:lower:]):1.0

echo -e "\nCreating Docker Build...\n"

docker build -f aws/Dockerfile.aws \
--build-arg ECR_BASE_REPO_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BASE_IMAGE} \
--build-arg SERVER_PORT=${APP_PORT} --build-arg APP_PORT=${APP_PORT} \
--build-arg LOGIN_USERNAME=${DOCKER_USERNAME} --build-arg LOGIN_USERNAME_PWD=${DOCKER_USERNAME_PWD} \
--build-arg APP_RUN_OPTION=${APP_RUN_OPTION} \
-t ${image} .

if [ $? -ne 0 ]; then
    echo "Docker Build Failed, program will exit."
    exit 1
fi

echo -e "\nExecuting Docker Container \n"

docker run -dit --name ${APP_CONTAINER_NAME} \
-e SERVER_HOST=${APP_HOST} -e SERVER_PORT=${APP_PORT} -e APP_HOST=${APP_HOST} -e APP_PORT=${APP_PORT} \
-e N_ENV=${NODE_ENV} -e NPM_CONFIG_LOGLEVEL=${NPM_CONFIG_LOGLEVEL} \
-e APP_RUN_OPTION=${APP_RUN_OPTION} -e APP_ENV=${APP_ENV} \
-p ${APP_PORT}:${APP_PORT} ${image}

if [ $? -eq 0 ]; then
    echo && echo "================================================================"
    echo "'Health Checker' Application Launcher Setup in PROD setup Mode FINISHED ${succCol}SUCCESSFULLY${succCol}${reset}. " 
    echo "=============================================================" && echo
else
    echo -e "\n!! Health Checker Application Launcher Setup ${errCol}FAILED${errCol}${reset}. !!"
    exit 1
fi

echo -e "\nRunning Application Container logs...\n"
docker logs -f ${APP_CONTAINER_NAME}
