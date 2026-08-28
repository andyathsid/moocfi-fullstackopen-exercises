import { Country } from './country'

export const Content = ({ filteredCountries, onShow }) => {
  let content = null

  if (filteredCountries.length > 10) {
    content = <p>Too many matches, specify another filter</p>
  } else if (filteredCountries.length > 1) {
    content = filteredCountries.map(country => (
      <p key={country.cca3}>
        {country.name.common}
        <button type="button" onClick={() => onShow(country)}>show</button>
      </p>
    ))
  } else if (filteredCountries.length === 1) {
    content = <Country country={filteredCountries[0]} />
  }

  return <div>{content}</div>
}
