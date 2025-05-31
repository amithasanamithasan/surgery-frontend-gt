import React from 'react'
import Breadcrumb from '../Partials/Breadcrumb'
import { Link } from 'react-router-dom'

const Error500 = () => {
    return (
        <>
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                    <h1 className="text-6xl font-bold text-red-600">500</h1>
                    <p className="text-xl font-semibold mt-2 text-gray-800">Internal Server Error</p>
                    <p className="mt-4 text-gray-600">Oops! Something went wrong on our end. Please try again later or contact support if the problem persists.</p>
                    <Link to="/" className="mt-6 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Go Back to Home
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Error500