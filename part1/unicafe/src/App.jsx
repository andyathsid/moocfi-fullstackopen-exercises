import { useState } from 'react'

const Button = (props) => (
  <button onClick={props.onClick}>
    {props.text}
  </button>
)

const StaticsticLine = ({ text, value }) => (
  <tr>
    <td>{text}</td>
    <td>{value}</td>
  </tr>
)

const Statistics = ({ good, neutral, bad }) => {
  const total = good + neutral + bad
  const average = (good - bad) / total || 0
  const positive = total ? (good / total) * 100 : 0 
  return (
    <div>
      <h1>statistics</h1>
      <table>
        <tbody>
          <StaticsticLine text="good" value={good} />
          <StaticsticLine text="neutral" value={neutral} />
          <StaticsticLine text="bad" value={bad} />
          <StaticsticLine text="all" value={total} />
          <StaticsticLine text="average" value={average.toFixed(2)} />
          <StaticsticLine text="positive" value={`${positive.toFixed(2)} %`} />
        </tbody>
      </table>
    </div>
  )
}



const App = () => {

  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={() => setGood(good + 1)} text="good" />
      <Button onClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button onClick={() => setBad(bad + 1)} text="bad" />
      {good + neutral + bad === 0 ? (
        <p>No feedback given</p>
      ) : <Statistics good={good} neutral={neutral} bad={bad} />}
    </div>
  )
}

export default App