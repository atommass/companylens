Working Cookie flow


cd /c/Users/Elgars/web_dev/companylens/backend
rm -f cookies.txt

curl -i -c cookies.txt -b cookies.txt \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000/" \
  http://localhost:8000/sanctum/csrf-cookie

XSRF=$(awk '$6=="XSRF-TOKEN"{print $7}' cookies.txt | tail -n 1 | sed 's/%3D/=/g; s/%2B/+/g; s/%2F/\//g')

curl -i -c cookies.txt -b cookies.txt \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000/" \
  -H "X-XSRF-TOKEN: $XSRF" \
  -X POST http://localhost:8000/api/auth/login \
  -d '{"email":"admin@example.com","password":"password"}'

curl -i -c cookies.txt -b cookies.txt \
  -H "Accept: application/json" \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000/" \
  http://localhost:8000/api/auth/me