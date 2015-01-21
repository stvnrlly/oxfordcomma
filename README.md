# Oxford Comma

This node app watches the Twitter stream to find tweets that do or don't use the Oxford comma. It displays a running tally on a site.

## Installation

Get the repo, create a new JSON file, and pull the dependencies:

```
git clone https://github.com/stvnrlly/oxfordcomma.git
cd oxfordcomma
mv count.json.template public/count.json
npm install
```

You'll also need API stuff for Twitter. Once you have that, put all 4 variables in a file called `.env`.

Finally, just do `foreman start` and things should start to happen.
