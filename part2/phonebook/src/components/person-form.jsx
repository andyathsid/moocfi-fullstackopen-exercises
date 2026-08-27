const PersonForm = ({ onSubmit, newName, setNewName, newNumber, setNewNumber }) => {
    return (
      <form onSubmit={onSubmit}>
        <div>
          Name: <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
        </div>
        <div>
          Number: <input
            value={newNumber}
            onChange={(event) => setNewNumber(event.target.value)}
          />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    )
}

export default PersonForm