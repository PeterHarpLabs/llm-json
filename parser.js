function Parser(tokens)
{
  this.tokens = tokens;
  this.index = 0;
}

Parser.prototype.current = function()
{
  if (this.done())
  {
    console.log(this.tokens);
    throw new Error('Parser went past end of token list');
  }

  return this.tokens[this.index];
}

Parser.prototype.advance = function()
{
  this.index += 1;
}

Parser.prototype.next = function()
{
  this.index += 1;
  const token = this.current();
  return token;
}

Parser.prototype.done = function()
{
  return this.index === this.tokens.length
}

Parser.prototype.parse = function()
{
  const token = this.current();
  const json = this.parseValue(token);

  if (this.done())
  {
    return json;
  }

  throw new Error(`Extraneous content at index ${this.index}`);
}

Parser.prototype.parseObject = function()
{
  const members = [];

  let token = this.current();
  if (token.value === '}')
  {
    this.advance();
    return {};
  }

  while (true)
  {
    let member = {}
    if (token.type !== 'string' && token.type !== 'literal')
    {
      this.fail(token.index);
    }

    member.key = token.value;

    token = this.next();
    if (token.value !== ':') this.fail(token.index);

    member.value = this.parseValue(this.next());
    members.push(member);

    token = this.current();

    if (token.value === '}')
    {
      this.advance();
      break;
    }

    if (token.value === ',') token = this.next();
    else this.fail();
  }

  const object = {};
  for (const member of members)
  {
    if (object[member.key] !== undefined)
    {
      throw new Error(`Duplicate key ${member.key}`);
    }

    object[member.key] = member.value;
  }

  return object;
}

Parser.prototype.parseArray = function()
{
  const array = [];

  let token = this.current();
  if (token.value === ']')
  {
    this.advance();
    return [];
  }

  while (true)
  {
    array.push(this.parseValue(token));

    token = this.current();
    if (token.value === ']')
    {
      this.advance();
      break;
    }

    if (token.value === ',') token = this.next();
    else this.fail();
  }

  return array;
}

Parser.prototype.parseValue = function(token)
{
  this.advance();

  if (token.type === 'string') return this.parseString(token.value)
  if (token.type === 'number') return token.value;
  if (token.value === '{') return this.parseObject();
  if (token.value === '[') return this.parseArray();

  if (token.type === 'literal')
  {
    if (token.value === 'null') return null;
    if (token.value === 'false') return false;
    if (token.value === 'true') return true;
  }

  throw new Error(`Unknown token type ${token.type}`);
}

Parser.prototype.parseString = function(string)
{
  if (this.done()) return string;

  const symbol = this.current();
  if (symbol.type === 'symbol' && symbol.value === '+')
  {
    const token = this.next();

    if (token.type === 'string')
    {
      this.advance();
      return this.parseString(`${string}${token.value}`);
    }
    else
    {
      throw new Error(`Dangling plus sign after string at ${string.index}`);
    }
  }

  return string;
}

Parser.prototype.fail = function()
{
  throw new Error(`Unexpected input at index ${this.tokens[this.index].index}.`);
}

exports.Parser = Parser;
