import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    window.api.leerDB().then((resultado) => {
      console.log('datos:', resultado)
      setData(resultado)
    })
  }, [])

  return (
    <div>
      <p>{JSON.stringify(data, null, 2)}hoolaasjdjaskj</p>
    </div>
  )
}

export default App
