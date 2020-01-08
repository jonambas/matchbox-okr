import React from "react"
import Button from "../button"
import Graph from "./Graph"

import size from "../../raw-data/size.json"

function SizeGraph(props) {
  const [date, setDate] = React.useState("2019-12-01")

  const last = React.useMemo(() => {
    return size[date]
  }, [date])

  return (
    <>
      <h1>JS & CSS Size</h1>

      <Graph onClick={setDate} />

      <div style={{ textAlign: "center" }}>
        <div>Ratio: {((last.css / last.js) * 100).toFixed(2)}%</div>
        <div>JS: {last.js}</div>
        <div>CSS: {last.css}</div>
        <div>Date: {date}</div>
      </div>
    </>
  )
}

export default SizeGraph
