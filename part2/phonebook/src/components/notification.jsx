const Notification = ({ message, type }) => {
  if (!message) {
    return null
  }

  return (
    <div className={type} role={type === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  )
}

export default Notification
