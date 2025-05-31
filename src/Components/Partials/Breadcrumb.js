import React from 'react'
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';

const Breadcrumb = (props) => {
    return (
        <>
        <Helmet>
            <title> {props.title} | Surgery </title>
        </Helmet>

            {/* <h1 className="mt-4">Dashboard</h1> */}
            <ol className="breadcrumb mb-4 d-flex flex-row flex-nowrap ">
                <Link to='/' className='text-decoration-none'> <li className="breadcrumb-item m-2">Dashboard</li></Link>
                <li className="breadcrumb-item active m-2 ps-0">/ {props.title}</li>
            </ol>
        </>
    )
}

export default Breadcrumb