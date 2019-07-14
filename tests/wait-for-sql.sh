until nc -z -v -w30 localhost 3306
do
  echo "Waiting for database connection..."
  # wait for 5 seconds before check again
  sleep 5
done