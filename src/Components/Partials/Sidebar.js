import React from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery';

const Sidebar = () => {

    const handleSidebar = () => {
        $('body').removeClass('sb-sidenav-toggled')
    }

    return (

        <div>
            <nav>
                
            </nav>
        </div>

    )
}

export default Sidebar