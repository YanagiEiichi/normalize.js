uglifyjs:
	test -x "$$(which uglifyjs)" || npm install uglifyjs -g

build: uglifyjs
	uglifyjs normalize.js --source-map normalize.map --output normalize.min.js -m

tag:
	git checkout $$(git rev-parse HEAD)
	make build
	git add normalize.* -f
	git commit -m 'make build'
	git tag $$(node -p -e 'require("./bower.json").version')
	git checkout -
