#!/bin/sh
# wait-for-mysql.sh

set -e

host="$1"
shift
cmd="$@"

until mysql -h"$host" -u"${DB_USERNAME}" -p"${DB_PASSWORD}" --ssl-mode=DISABLED -e 'SELECT 1' >/dev/null 2>&1; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "MySQL is up - executing command"
exec $cmd
