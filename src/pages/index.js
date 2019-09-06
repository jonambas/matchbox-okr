import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Button from "../components/button"
import ChangeGraph from "../components/ChangeGraph/ChangeGraph"
import TokenizableCss from "../components/TokenizableCss/TokenizableCss"
import TokenizableJs from "../components/TokenizableJs/TokenizableJs"

const IndexPage = () => {
  return (
    <Layout>
      <SEO title="Home" />
      <ChangeGraph />
      <TokenizableCss/>
      <TokenizableJs/>
    </Layout>
  )
}

export default IndexPage
