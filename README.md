[![Created by Harplabs](logo.png)](https://www.harplabs.com)

# LLM-JSON

A parser than can make sense of unusual structures returned by LLM.

## Usage

```
const { parser } = require('llm-json');

const json = '{ "hey": "there" + " pussycat" }';
return parser.parse(json);
```
