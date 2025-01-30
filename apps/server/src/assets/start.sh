#!/bin/bash

if [ $# -ne 2 ]; then
  echo "Usage: $0 <inputNum> <inputText>"
  exit 1
fi

inputNum=$1
inputText=$2

echo "Script started with inputNum=$inputNum and inputText=$inputText"

sleep 5

echo "Execution completed:
Num: $inputNum
Text: $inputText"
