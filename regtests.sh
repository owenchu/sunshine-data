#!/bin/bash
# tputcolors

success=true

for test_file in test-data/*.json
do
    filename=$(basename "$test_file")
    case="${filename%.*}"

    if [ $case == 許添財 ]; then
        echo $case $(tput setaf 3)SKIPPED$(tput sgr0)
        continue
    fi

    if [ ! -f input.txt ]; then
        echo Converting PDF to text...
        node pdf-to-text.js test-data/監察院廉政專刊第61期.pdf > input.txt
    fi

    rm -f /tmp/$case.json
    node normalize-text.js < input.txt | node text-to-json.js $case > /tmp/$case.json
    diff /tmp/$case.json test-data/$case.json > /dev/null

    if [ $? == 0 ]; then
        echo $case $(tput setaf 2)PASSED$(tput sgr0)
    else
        echo $case $(tput setaf 1)NOT PASSED$(tput sgr0)
        success=false
    fi
done

if [ $success = true ]; then
    echo $(tput setaf 2)ALL PASSED$(tput sgr0)
    exit 0
else
    echo $(tput setaf 1)FAILED$(tput sgr0)
    exit 1
fi
