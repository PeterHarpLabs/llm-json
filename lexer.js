function Lexer(text)
{
  this.text = text;
  this.index = 0;
  this.tokens = [];
}

Lexer.prototype.current = function()
{
  if (this.done())
  {
    throw new Error('Lexer went past end of token list');
  }

  return this.text[this.index];
}

Lexer.prototype.advance = function()
{
  this.index += 1;
}

Lexer.prototype.next = function()
{
  this.index += 1;
  return this.current();
}

Lexer.prototype.done = function()
{
  return this.index >= this.text.length;
}

Lexer.prototype.tokenize = function()
{
  while (this.current().charCodeAt(0) === 65533)  // BOM
  {
    this.advance();
  }

  while (!this.done())
  {
    let symbol = this.current();
    this.startIndex = this.index;

    if (symbol === "'" || symbol === '"')
    {
      this.lexString(symbol);
      this.advance();
    }
    else if (/\s/.test(symbol) || symbol === '\x00')
    {
      this.advance();
    }
    else if (/[_A-Za-z]/.test(symbol))
    {
      let literal = symbol;

      while (true)
      {
        this.advance();
        if (this.done()) break;
        symbol = this.current();

        if (/[_A-Za-z0-9]/.test(symbol))
        {
          literal += symbol;
        }
        else break;
      }

      this.addToken('literal', literal);
    }
    else if (/[\d-]/.test(symbol)) this.lexNumber(symbol);
    else
    {
      this.addToken('symbol', symbol);
      this.advance();
    }
  }

  return this.tokens;
}

Lexer.prototype.lexString = function(delimiter)
{
  let string = '';

  while (true)
  {
    let chr = this.next();

    if (chr === delimiter) break;

    if (chr === '\\')
    {
      string += '\\';
      string += this.next();
    }
    else
    {
      string += chr;
    }
  }

  this.addToken('string', string);
}

Lexer.prototype.lexNumber = function()
{
  let group = '';

  const traverseNumber = () =>
  {

    let symbol = this.current();

    if (symbol === '-')
    {
      group = symbol;
      symbol = this.next();
    }

    if (!/\d/.test(symbol)) this.fail();

    while (true)
    {
      if (/\d/.test(symbol))
      {
        group += symbol;
        this.advance();
      }
      else break;

      if (this.done()) return;
      symbol = this.current();
    }

    if (this.current() === '.')
    {
      group += '.';
      symbol = this.next();

      if (!/\d/.test(symbol)) this.fail();

      while (true)
      {
        if (/\d/.test(symbol))
        {
          group += symbol;
        }
        else break;

        this.advance();
        if (this.done()) return;
        symbol = this.current();
      }
    }

    if (/[eE]/.test(this.current()))
    {
      group += 'E';
      symbol = this.next();
      if (symbol === '-' || symbol === '+')
      {
        group += symbol;
        symbol = this.next();
      }

      if (!/\d/.test(symbol)) this.fail();

      while (true)
      {
        if (/\d/.test(symbol))
        {
          group += symbol;
        }
        else break;

        this.advance();
        if (this.done()) return;
        symbol = this.current();
      }
    }
  }

  traverseNumber();
  const number = Number(group);
  if (number === null) this.fail();
  this.addToken('number', number);
}

Lexer.prototype.addToken = function(type, value)
{
  this.tokens.push({ type, value, index: this.startIndex });
}

Lexer.prototype.fail = function()
{
  const index = this.startIndex;
  const prelude = this.text.substring(index - 20, index);
  const postlude = this.text.substring(index, index + 20);
  throw new Error(`Unexpected input at index ${index}:\n${prelude} <--- HERE\n${postlude}`);
}

exports.Lexer = Lexer;
