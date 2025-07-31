set -e

image=mereith/langmanus-web

docker build --platform linux/amd64 -t $image .
docker push $image