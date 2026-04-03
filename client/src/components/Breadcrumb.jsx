import React, { useEffect, useState } from 'react'
import { getBreadcrumb } from '../api/directoryApi'
import { FaArrowAltCircleRight, FaLongArrowAltRight } from 'react-icons/fa'

const Breadcrumb = ({path,dirId}) => {
    const [breadcrumbData, setBreadcrumbData] = useState(null)

    useEffect(() => {
        async function fetchBreadcrumb(path,dirId) {
            try {
                const res = await getBreadcrumb(path,dirId)
                setBreadcrumbData(res.breadcrumbs) // Update state with the fetched breadcrumb data
            } catch (error) {
                console.error("Error fetching breadcrumb:", error.message)
            }
        }

        if (path) {
            fetchBreadcrumb(path,dirId)
        }
    }, [dirId])

    return (
        <div className="breadcrumb-container flex items-center space-x-2 text-gray-700  mb-4">
            {dirId ? <>
            {breadcrumbData ? (
                breadcrumbData.map((item, index) => (
                    <div key={index} className="breadcrumb-item flex items-center">
                        {item.name.startsWith("root") ? (
                            <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                                ROOT
                            </span>
                        ) : (
                            <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                                {item.name}
                            </span>
                        )}
                        {index < breadcrumbData.length - 1 && (
                            <span className="mx-2 text-gray-400"><FaLongArrowAltRight/></span>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500">Loading breadcrumb...</p>
            )}</> : <span className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                                ROOT
                            </span>}
        </div>
    )
}

export default Breadcrumb