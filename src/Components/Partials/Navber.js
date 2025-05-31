import React from 'react';
import $ from 'jquery';
// import Logo from "../../Assets/Media/Logo.png"
import Swal from 'sweetalert2'
import { AxiosAuthInstance } from '../../AxiosInterceptors';
import { Link } from 'react-router-dom';

const Navber = () => {

    const handleSidebar = () => {
        $('body').toggleClass('sb-sidenav-toggled')
    }

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be Logout from Padma Bilash ERP!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Swal.fire(
                //     'Logout!',
                //     'Your are Logout.',
                //     'success'
                // )

                AxiosAuthInstance.post('logout').then((r) => {

                    localStorage.removeItem('id')
                    localStorage.removeItem('email')
                    localStorage.removeItem('phone')
                    localStorage.removeItem('name')
                    localStorage.removeItem('username')
                    localStorage.removeItem('role')
                    localStorage.removeItem('token')
                    window.location.href = '/';
                });
            }
        })
    }

    return (
        <nav className="sb-topnav navbar navbar-expand navbar-dark custom-bg text-white">
            {/* <!-- Navbar Brand--> */}
            <Link className="navbar-brand ps-5 mt-2" to="/">
                {/* <img src={Logo} alt={Logo} width="25%" /> */}
            </Link>
            {/* <!-- Sidebar Toggle--> */}
            <button onClick={handleSidebar} className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i className="fas fa-bars"></i></button>
            {/* <!-- Navbar--> */}
            <ul className="navbar-nav ms-auto me-lg-4 align-items-center">
                <p className='tw d-none d-sm-flex'> {localStorage.name !== undefined ? localStorage.name : null} </p>
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-user fa-fw"></i></a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><Link className="dropdown-item" to="/profile">Settings</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button onClick={handleLogout} className="dropdown-item" >Logout</button></li>
                    </ul>
                </li>
            </ul>
        </nav>
    )
}

export default Navber