const Person = ({ person, deletePerson }) => {
  const handleDelete = () => {
    if (window.confirm(`Delete ${person.name}?`)) {
      deletePerson()
    }
  }

  return (
    <div>
      {person.name} {person.number}
      <button onClick={handleDelete}>delete</button>
    </div>
  )
}

export default Person