import test from 'ava'
import path from 'path'
import caller from 'grpc-caller'
import Mali from 'mali'
import grpc from 'grpc'

import metadata from '../'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getHostport (port) {
  return '0.0.0.0:'.concat(port || getRandomInt(1000, 60000))
}

const PROTO_PATH = path.resolve(__dirname, './metadata.proto')
const DYNAMIC_HOST = getHostport()
const apps = []
let client

test.before('should dynamically create service', t => {
  function handler (ctx) {
    ctx.res = ctx.req
  }

  const app = new Mali(PROTO_PATH, 'MetaService')
  t.truthy(app)
  apps.push(app)

  app.use(metadata('param1', async (param1, ctx, next) => {
    const msg = ctx.req.message || ''
    const nm = msg.concat(':param1=', param1 || '')
    ctx.req.message = nm
    await next()
  }))

  app.use(metadata('param2', { truthy: true }, async (param2, ctx, next) => {
    const msg = ctx.req.message || ''
    ctx.req.message = msg.concat(':param2=', param2.toString())
    await next()
  }))

  const param3mw = metadata('param3', { type: 'boolean' }, async (param3, ctx, next) => {
    const msg = ctx.req.message || ''
    ctx.req.message = msg.concat(':param3=', param3 || '')
    await next()
  })

  app.use('do1', handler)
  app.use('do2', param3mw, handler)
  const server = app.start(DYNAMIC_HOST)

  t.truthy(server)

  client = caller(DYNAMIC_HOST, PROTO_PATH, 'MetaService')
})

test('Should catch param 1', async t => {
  t.plan(3)
  const meta = new grpc.Metadata()
  meta.add('param1', 'foo')
  const response = await client.do1({ message: 'msg' }, meta)
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=foo')
})

test('Should catch param 1 even when not provided', async t => {
  t.plan(3)
  const response = await client.do1({ message: 'msg' })
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=')
})

test('Should catch param 1 and param 2 when param 1 not specified', async t => {
  t.plan(3)
  const meta = new grpc.Metadata()
  meta.add('param2', '10')
  const response = await client.do1({ message: 'msg' }, meta)
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=:param2=10')
})

test('Should catch param 1 and not param 2 when param 2 not truthy', async t => {
  t.plan(3)
  const meta = new grpc.Metadata()
  meta.add('param2', '')
  const response = await client.do1({ message: 'msg' }, meta)
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=')
})

test('Should catch param 1 and param 2', async t => {
  t.plan(3)
  const meta = new grpc.Metadata()
  meta.add('param1', 'foo')
  meta.add('param2', '11')
  const response = await client.do1({ message: 'msg' }, meta)
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=foo:param2=11')
})

test('Should catch param 3 and no param 2', async t => {
  t.plan(3)
  const meta = new grpc.Metadata()
  meta.add('param1', 'foo')
  const response = await client.do2({ message: 'msg' }, meta)
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=foo:param3=')
})

test('Should catch param 3', async t => {
  t.plan(3)
  const meta = new grpc.Metadata()
  meta.add('param1', 'foo')
  meta.add('param2', '12')
  meta.add('param3', 'true')
  const response = await client.do2({ message: 'msg' }, meta)
  t.truthy(response)
  t.truthy(response.message)
  t.is(response.message, 'msg:param1=foo:param2=12:param3=true')
})

test.after.always('guaranteed cleanup', t => {
  apps.forEach(app => app.close())
})
