const head = document.querySelector('head')
const body = document.querySelector('body')

// mocha CSS link
const mochaCSSPath = "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.css"
const mochaCSSLinkEl = document.createElement('link')
mochaCSSLinkEl.rel = 'stylesheet'
mochaCSSLinkEl.href = mochaCSSPath
head.prepend(mochaCSSLinkEl)

// custom styles for mocha runner
const mochaStyleEl = document.createElement('style')
mochaStyleEl.innerHTML =
  `#mocha {
    font-family: sans-serif;
    position: fixed;
    overflow-y: auto;
    z-index: 1000;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 48px 0 96px;
    background: white;
    color: black;
    display: none;
    margin: 0;
  }
  #mocha * {
    letter-spacing: normal;
    text-align: left;
  }
  #mocha .replay {
    pointer-events: none;
  }
  #mocha-test-btn {
    position: fixed;
    bottom: 50px;
    right: 50px;
    z-index: 1001;
    background-color: #007147;
    border: #009960 2px solid;
    color: white;
    font-size: initial;
    border-radius: 4px;
    padding: 12px 24px;
    transition: 200ms;
    cursor: pointer;
  }
  #mocha-test-btn:hover:not(:disabled) {
    background-color: #009960;
  }
  #mocha-test-btn:disabled {
    background-color: grey;
    border-color: grey;
    cursor: initial;
    opacity: 0.7;
  }`
head.appendChild(mochaStyleEl)

// mocha div
const mochaDiv = document.createElement('div')
mochaDiv.id = 'mocha'
body.appendChild(mochaDiv)

// run tests button
const testBtn = document.createElement('button')
testBtn.textContent = "Loading Tests"
testBtn.id = 'mocha-test-btn'
testBtn.disabled = true
body.appendChild(testBtn)

const scriptPaths = [
  "https://cdnjs.cloudflare.com/ajax/libs/mocha/8.3.2/mocha.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/chai/4.3.4/chai.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/sinon.js/10.0.1/sinon.min.js",
  // "jsdom.js" // npx browserify _jsdom.js --standalone JSDOM -o jsdom.js
]
const scriptTags = scriptPaths.map(path => {
  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = path
  return scriptTag
})

let loaded = 0
if (localStorage.getItem('test-run')) {
  // lazy load test dependencies
  scriptTags.forEach(tag => {
    body.appendChild(tag)
    tag.onload = function () {
      if (loaded !== scriptTags.length - 1) {
        loaded++
        return
      }
      testBtn.textContent = 'Run Tests'
      testBtn.disabled = false
      testBtn.onclick = __handleClick
      runTests()
    }
  })
} else {
  testBtn.textContent = 'Run Tests'
  testBtn.disabled = false
  testBtn.onclick = __handleClick
}

function __handleClick() {
  if (!localStorage.getItem('test-run') && this.textContent === 'Run Tests') {
    localStorage.setItem('test-run', true)
  } else {
    localStorage.removeItem('test-run')
  }
  window.location.reload()
}

function runTests() {
  testBtn.textContent = 'Running Tests'
  testBtn.disabled = true
  mochaDiv.style.display = 'block'
  body.style.overflow = 'hidden'

  mocha.setup("bdd");
  const expect = chai.expect;

  describe("Pokemon Practice", function() {
    document.querySelector('form').addEventListener('submit', e => e.preventDefault())
    const formBtn = document.querySelector('button')
    const input = document.querySelector('input')
    const getPokemonDiv = () => document.querySelector('#pokemon')
    let fetchStub
    const pokemonResponse = {
      "height": 15,
      "id": 94,
      "name": "gengar",
      "sprites": {
          "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
      },
      "types": [
          {
              "slot": 1,
              "type": {
                  "name": "ghost",
                  "url": "https://pokeapi.co/api/v2/type/8/"
              }
          },
          {
              "slot": 2,
              "type": {
                  "name": "poison",
                  "url": "https://pokeapi.co/api/v2/type/4/"
              }
          }
      ],
      "weight": 405
    }
    const stubFetch = (response, code) => fetchStub = sinon
      .stub(window, 'fetch')
      .resolves({
        status: code,
        json: sinon.stub().resolves(pokemonResponse)
      })
    async function searchPokemon(name) {
      input.value = name
      formBtn.click()
      return new Promise(res => setTimeout(res, 0))
    }
    beforeEach(() => {
      expect(getPokemonDiv().innerHTML).to.eq("")
      stubFetch(pokemonResponse, 200)
    })
    afterEach(() => {
      sinon.restore()
      getPokemonDiv().innerHTML = ""
    })
    after(() => {
      testBtn.textContent = 'Close Tests'
      testBtn.disabled = false
    })
    it('should call fetch when searching', async () => {
      await searchPokemon('gengar')
      expect(fetchStub.called).to.be.true
    })
    it('should NOT call fetch when search term is blank', async () => {
      await searchPokemon('')
      expect(fetchStub.called).to.be.false
    })
    it('should call fetch with correct URL including search term', async () => {
      await searchPokemon('gengar')
      expect(fetchStub.firstCall.args[0]).to.eq('https://pokeapi.co/api/v2/pokemon/gengar')
    })
    it("should display pokemon's name", async () => {
      await searchPokemon('gengar')
      expect(getPokemonDiv().innerHTML).to.include(pokemonResponse.name)
    })
    it("should display pokemon's img with alt text of pokemon name", async () => {
      await searchPokemon('gengar')
      const img = getPokemonDiv().querySelector('img')
      expect(img.src).to.eq(pokemonResponse.sprites.front_default)
      expect(img.alt.toLowerCase()).to.eq(pokemonResponse.name)
    })
    it("should display pokemon's height in inches", async () => {
      await searchPokemon('gengar')
      expect(getPokemonDiv().innerHTML).to.include('59')
    })
    it("should display pokemon's weight in pounds", async () => {
      await searchPokemon('gengar')
      expect(getPokemonDiv().innerHTML).to.include('89')
    })
    it("should display pokemon's types", async () => {
      await searchPokemon('gengar')
      const pokemonHTML = getPokemonDiv().innerHTML.toLowerCase()
      expect(pokemonHTML).to.include('ghost')
      expect(pokemonHTML).to.include('poison')
    })
    it("should NOT display more than one pokemon at a time", async () => {
      await searchPokemon('gengar')
      fetchStub.restore()
      stubFetch({
        "name": "banana",
      }, 200)
      const pokemonHTML = getPokemonDiv().innerHTML.toLowerCase()
      expect(pokemonHTML).to.not.include('banana')
    })
    it("BONUS: should show error message from fetch if fetch errors", async () => {
      fetchStub.restore()
      sinon.stub(window, 'fetch').rejects(new Error('oh no'))
      await searchPokemon('gengar')
      const pokemonHTML = getPokemonDiv().innerHTML.toLowerCase()
      expect(pokemonHTML).to.include('oh no')
    })
    it("BONUS: should show 'pokemon not found' if fetch does not return a 200", async () => {
      fetchStub.restore()
      stubFetch({}, 404)
      await searchPokemon('gengar')
      const pokemonHTML = getPokemonDiv().innerHTML.toLowerCase()
      expect(pokemonHTML).to.include('pokemon not found')
    })
  });

  mocha.run();
}