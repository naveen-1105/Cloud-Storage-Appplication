import React, { useEffect, useState } from 'react'
import { getBreadcrumb } from '../api/directoryApi'

const Breadcrumb = ({id}) => {
    const [Breadcrumb,setBreadcrumb] = useState(null)
    useEffect(() => {
      try {
        console.log(id);
          const path = getBreadcrumb(id)
          setBreadcrumb(path)
      } catch (error) {
        console.log(error);
      }
    },[id])
  return (
    <div></div>
  )
}

export default Breadcrumb