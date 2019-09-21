import {base, sleep} from './util'
import {route, router, setBase} from '../'
import {expect} from 'chai'
import {spy} from 'sinon'

describe('standalone hash', function() {
  beforeEach(() => {
    setBase(`${base}#`)
  })

  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('hash links dispatch events', async function() {
    const onRoute = spy()
    const hello = route('/hello').on.value(onRoute)

    router.push(`${base}#/hello`)

    await sleep()

    expect(onRoute).to.have.been.called
    hello.end()
  })

  it('hash links receive parameters', (done) => {
    const user = route('/user/:username').on.value((url) => {
      user.end()
      expect(url.params).to.be.deep.equal(['gianluca'])
      done()
    })

    router.push(`${base}#/user/gianluca`)
  })
})