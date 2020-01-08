import React from "react"
import { Bar } from "@vx/shape"
import { Group } from "@vx/group"
import { scaleBand, scaleLinear } from "@vx/scale"
import moment from "moment"
import _ from "lodash"

import data from "../raw-data/token-count-raw.json"

function Graph({ xKey = "css", onClick }) {
  const dataMap = _.sortBy(
    Object.keys(data).reduce((acc, key) => {
      acc.push({ date: key, ...data[key] })
      return acc
    }, []),
    ["date"]
  )

  const x = d => d.date
  const y = d => d[xKey]

  const width = 800
  const height = 300

  const xMax = width
  const yMax = height - 90
  const yMin = 0

  // scales
  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: dataMap.map(x),
    padding: 0.06,
  })
  const yScale = scaleLinear({
    rangeRound: [yMax, yMin],
    domain: [0, Math.max(...dataMap.map(y))],
  })

  return (
    <svg width={width} height={height}>
      <Group top={40}>
        {dataMap.map((d, i) => {
          const letter = x(d)
          const barWidth = xScale.bandwidth()
          const barHeight = yMax - yScale(y(d))

          const barX = xScale(letter)
          let barY = yMax - barHeight

          return (
            <Group
              key={`fbar-${letter}`}
              onClick={() => onClick(d.date)}
              style={{
                cursor: "pointer",
              }}
            >
              <rect
                x={barX}
                y={yMax - height}
                width={barWidth}
                height={height}
                fill={
                  moment(d.date).isBefore("2018-5-20")
                    ? "rgba(235, 225, 225, 1)"
                    : "rgba(235, 235, 245, 1)"
                }
              />
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={Math.abs(barHeight)}
                fill="rgba(90, 90, 250, 1)"
                style={{ pointerEvents: "none" }}
              />
            </Group>
          )
        })}
      </Group>
      <Group left={20} top={yMax + 60}>
        <rect fill="rgba(235, 225, 225, 1)" width={10} height={12} />
        <text dx={20} dy={12}>
          Beta
        </text>
        <rect x={80} fill="rgba(235, 235, 245, 1)" width={10} height={12} />
        <text dx={100} dy={12}>
          Public
        </text>
      </Group>
    </svg>
  )
}

export default Graph
