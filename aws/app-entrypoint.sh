#!/usr/bin/env bash
set -ea

echo "______________________________________________" && echo

export APP_ENV=${APP_ENV}
echo && echo "Env set to: ${APP_ENV}"

cd ${ENV_WORK_DIR}/healthChecker
echo 

ls -al
echo

echo && echo "=> Starting Health Checker app..." && echo
echo "   Please wait until you see application URL." && echo


# Run app
npm run ${ENV_APP_RUN_OPTION}

if [ $? -eq 0 ]; then
    echo && echo "=========================="
    echo "Health Checker app Started." 
    echo && echo "=========================="
fi

exec "$@"
