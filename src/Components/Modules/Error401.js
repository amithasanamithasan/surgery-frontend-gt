import React from 'react'
import Breadcrumb from '../Partials/Breadcrumb'
import { Link } from 'react-router-dom'

const Error401 = () => {
    return (
        <>
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                    <h1 className="text-4xl font-bold text-red-500">401</h1>
                    <p className="text-xl font-semibold mt-2">Unauthorized Access</p>
                    <p className="mt-4 text-gray-600">You don't have permission to access this page. Please check your credentials or contact support if you believe this is an error.</p>
                    <Link to="/" className="mt-6 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Go Back to Home
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Error401