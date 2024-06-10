const { Lexer } = require('./lexer');
const { Parser } = require('./parser');

exports.parse = function(string)
{
  const lexer = new Lexer(string);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}
