const pokemonDiv = document.getElementById('pokemon')
const form = document.querySelector('form')

form.onsubmit = async e => {
  e.preventDefault()
  const inputValue = this.pokemonName.value.trim()
  if (!inputValue) return
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${inputValue}`)
    if (res.status !== 200) throw new Error('Pokemon not found')
    const pokemon = await res.json()
    renderPokemon(pokemon)
  } catch(err) {
    pokemonDiv.innerHTML = err.message
  }
}

function renderPokemon({
  name,
  sprites: {
    front_default
  },
  height,
  weight,
  types
}) {
  this.pokemonName.value = ""
  pokemonDiv.innerHTML = `<h3>${name}</h3>
  <img src="${front_default}" alt="${name}">
  <p>${convertToInches(height)}</p>
  <p>${convertToPounds(weight)}</p>
  <p>Types: ${types.map(({type}) => type.name).join(", ")}</p>`
}

const convertToInches = decimeters => Math.round(decimeters * 10 / 2.54)

const convertToPounds = hectograms => Math.round(hectograms / 10 * 2.2)