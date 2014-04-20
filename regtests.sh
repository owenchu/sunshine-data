#!/bin/bash
# tputcolors

cases=( 丁守中 尤美女 王育敏 王進士 王惠美 何欣純 吳秉叡 吳育仁 吳育昇 李俊俋 李桐豪 李慶華 邱議瑩 林明溱 林郁方 林國正 林淑芬 林鴻池 姚文智 )
success=true

for case in "${cases[@]}"
do
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
