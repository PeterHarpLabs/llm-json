const fs = require('fs');
const { Lexer } = require('./lexer');
const { Parser } = require('./parser');

const files = fs.readdirSync('./regular-tests');

for (const file of files)
{
  if (!/json$/.test(file)) continue;

  const filename = `./regular-tests/${file}`;
  const fileData = fs.readFileSync(filename);
  console.log(`FILE: ${filename}`);

  json = fileData.toString();
  console.log("JSON:  ", json);

  const lexer = new Lexer(json);

  try
  {
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
      
    try
    {
      console.log("PARSED:", parser.parse(), '\n');
      if (file[0] === 'n')
      {
        console.log("This file should not have successfully parsed.");
        console.log("Parser tokens:\n", parser.tokens);
      }
    }
    catch(err)
    {
      if (file[0] === 'n')
      {
        console.log("FAILED TO PARSE AS EXPECTED");
      }
      else
      {
        console.log(err);
        console.log("Parser tokens:\n", parser.tokens);
        break;
      }
    }
  }
  catch (err)
  {
    if (file[0] === 'n')
    {
      console.log("FAILED TO LEX AS EXPECTED");
      continue;
    }
    else
    {
      console.log(err);
      break;
    }
  }
}
