find $1 -type f -name '*.tmp' -print0 | while read -d $'\0' f; do mv "$f" "${f%.tmp}"; done
