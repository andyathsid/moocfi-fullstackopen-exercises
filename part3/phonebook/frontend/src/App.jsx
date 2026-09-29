import { useEffect, useState } from 'react'
import Filter from './components/filter'
import PersonForm from './components/person-form'
import Persons from './components/persons'
import personService from './services/persons'
import Notification from './components/notification'

function App() {
  const [persons, setPersons] = useState([
  ])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    personService.getAll().then(initialPersons =>
      setPersons(initialPersons)
    )
  }, [])

  const deleteById = (id) => {
    const personToDelete = persons.find(person => person.id === id)

    personService.deleteData(id)
      .then(() => {
        setPersons(persons => persons.filter(person => person.id !== id))
      })
      .catch(error => {
        const wasAlreadyDeleted = error.response?.status === 404

        if (wasAlreadyDeleted) {
          setPersons(persons => persons.filter(person => person.id !== id))
        }

        setNotification({
          message: wasAlreadyDeleted
            ? `Information of ${personToDelete?.name ?? 'this person'} has already been removed from the server`
            : `Could not delete ${personToDelete?.name ?? 'this person'}. Please try again.`,
          type: 'error',
        })
      })
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const nameObject = {
      name: newName,
      number: newNumber,
    }
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personService
          .update(existingPerson.id, nameObject)
          .then(returnedObject => {
            setPersons(currentPersons => currentPersons.map(person => person.id === existingPerson.id ? returnedObject : person))
            setNotification({
              message: `Changed ${returnedObject.name}'s number`,
              type: 'success',
            })
            setNewName('')
            setNewNumber('')
          })
          .catch(() => {
            setNotification({
              message: `Information of ${existingPerson.name} has already been removed from the server`,
              type: 'error',
            })
            setPersons(currentPersons =>
              currentPersons.filter(person => person.id !== existingPerson.id)
            )
          })
      }
    } else {
      personService
        .create(nameObject)
        .then(
          returnedObject => {
            setPersons(currentPersons => currentPersons.concat(returnedObject))
            setNotification({
              message: `Added ${returnedObject.name}`,
              type: 'success',
            })
            setNewName('')
            setNewNumber('')
          }
        )
        .catch(() => {
          setNotification({
            message: `Could not add ${newName}. Please try again.`,
            type: 'error',
          })
        })
    }
  }

  useEffect(() => {
    if (!notification) return

    const timer = setTimeout(() => {
      setNotification(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [notification])

  return (
    <div>
      <h2>Phonebook</h2>

      {notification ? <Notification message={notification.message} type={notification.type} /> : null}

      <Filter filter={filter} setFilter={setFilter} />

      <h2>Add a new number</h2>

      <PersonForm
        onSubmit={onSubmit}
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
      />

      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} deleteById={deleteById} />
    </div>
  )
}

export default App
