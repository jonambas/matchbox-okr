rm ./src/raw-data/token-count-raw.json
echo $'{}' > ./src/raw-data/token-count-raw.json
cd ../2web2ui

for a in "2017-07-01" "2017-08-01" "2017-09-01" "2017-10-01" "2017-11-01" "2017-12-01" "2018-01-01" "2018-02-01" "2018-03-01" "2018-04-01" "2018-05-01" "2018-06-01" "2018-07-01" "2018-08-01" "2018-09-01" "2018-10-01" "2018-11-01" "2019-12-01" "2019-01-01" "2019-02-01" "2019-03-01" "2019-04-01" "2019-05-01" "2019-06-01" "2019-07-01" "2019-08-01" "2019-09-01"
do
    echo ""
    echo "👀 $a"
    git checkout `git rev-list -n 1 --before="${a} 12:00" master`
    node ../matchbox-okr/scripts/token-count.js $a
done
