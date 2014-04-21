#!/bin/bash
# tputcolors

OUTPUT_DIR=out
TEST_OUTPUT_DIR=out/test
TEST_DATA_DIR=test-data

INPUT=$OUTPUT_DIR/input.txt
NORMALIZED_INPUT=$OUTPUT_DIR/input-normalized.txt

success=true

rm -rf $TEST_OUTPUT_DIR
mkdir -p $TEST_OUTPUT_DIR

if [ ! -f $INPUT ]; then
    echo Converting PDF to text...
    node pdf-to-text.js reports/監察院廉政專刊第61期.pdf > $INPUT
fi

rm -f $NORMALIZED_INPUT
node normalize-text.js < $INPUT > $NORMALIZED_INPUT

for test_file in $TEST_DATA_DIR/*.json
do
    filename=$(basename "$test_file")
    case="${filename%.*}"

    if [ $case == 許添財 ] || [ $case == 葉宜津 ]; then
        echo $case $(tput setaf 3)SKIPPED$(tput sgr0)
        continue
    fi

    node text-to-json.js $case < $NORMALIZED_INPUT > $TEST_OUTPUT_DIR/$case.json
    diff $TEST_OUTPUT_DIR/$case.json $TEST_DATA_DIR/$case.json > /dev/null

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
