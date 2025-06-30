# Containerization for Local Development Testing [Simulating PROD Docker Env]

This script 'launches' EMD Health Checker application simulating PROD Docker based environment.
This script is primarily built for development testings.

## Setup

Setup the Configuration like AWS profile, region and other parameters in `.conf` file

## Launching

1. cd to docker launcher:

     `cd docker/awsBuild`   

2. Assign execution permissions to scripts:

     `$ chmod -R 777 *.sh`

3. From the terminal, run:

     `$ ./launch.sh`
