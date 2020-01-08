import React from "react"
import styles from "./button.module.scss"

function Button(props) {
  const { children, ...rest } = props

  return (
    <button {...rest} className={styles.button}>
      {children}
    </button>
  )
}

export default Button
