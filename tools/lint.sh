#!/bin/bash

ls -1d *.js | xargs -t -L1 jsl -process
