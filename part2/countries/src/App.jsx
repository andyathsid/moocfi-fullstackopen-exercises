import { useState, useEffect } from 'react'
import axios from 'axios'
import { Content } from './components/content'

const App = () => {
  const [value, setValue] = useState('')
  const [countries, setCountries] = useState(null)

  useEffect(() => {
    console.log('fetching countries...')
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])


  const query = value.trim().toLowerCase()
  const filteredCountries = query
    ? countries.filter(country =>
      country.name.common.toLowerCase().includes(query)
    )
    : []

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  if (!countries) {
    return <p>Loading countries...</p>
  }

  return (
    <div>
      <form onSubmit={event => event.preventDefault()}>
        find countries <input value={value} onChange={handleChange} />
      </form>
      <Content
        filteredCountries={filteredCountries}
        onShow={country => setValue(country.name.common)}
      />
    </div>
  )
}

export default App
