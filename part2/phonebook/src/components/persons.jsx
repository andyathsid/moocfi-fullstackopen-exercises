import Person from './person'

const Persons = ({ persons, filter, deleteById }) => {

  return (
    <div>
      {persons
        .filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
        .map(person =>
          <Person key={person.id} person={person} deletePerson={() => deleteById(person.id)} />
        )}
    </div>
  )
}

export default Persons
