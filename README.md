# mali-metadata

Mali metadata middleware

[![npm version](https://img.shields.io/npm/v/mali-metadata.svg?style=flat-square)](https://www.npmjs.com/package/malie-metadata)
[![build status](https://img.shields.io/travis/malijs/metadata/master.svg?style=flat-square)](https://travis-ci.org/malijs/metadata)
[![Greenkeeper badge](https://badges.greenkeeper.io/malijs/metadata.svg)](https://greenkeeper.io/)

## API Reference

<a name="module_mali-metadata"></a>

### mali-metadata
Mali metadata middleware. If the call has metadata with the specified property the
specified type the middleware function is executed.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the metadata object property |
| options | <code>Options</code> |  |
| options.truthy | <code>Boolean</code> | optional check for truthiness on the param value within the request.                                           Default: <code>false</code> |
| fn | <code>function</code> | The middleware function to execute |

**Example**  
```js
const metadata = require('mali-metadata')

async function requestId (requestId, ctx, next) {
  ctx.req.requestId = requestId
  await next()
}

app.use(metadata('requestId', { truthy: true }, requestId))
```
## License

  Apache-2.0
