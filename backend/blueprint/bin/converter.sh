#!/bin/bash

cd `dirname $0`

files=()
files+=('../overview.md')
files+=('../workspace.md')
files+=('../image.md')
files+=('../tag.md')


mkdir -p ../output 2>/dev/null
echo 'FORMAT: 1A' > ../output/api.md || exit $?
cat ${files[@]} | sed -e '/^FORMAT: 1A/d' >> ../output/api.md || exit $?
aglio -i ../output/api.md -o ../../../docs/api/v1/index.html || exit $?

exit 0
