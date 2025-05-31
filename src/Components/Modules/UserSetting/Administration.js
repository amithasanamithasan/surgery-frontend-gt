import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import Constant from "../../../Constant";
import { Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import Preloader from "../../Partials/preLoader";

const Administration = () => {
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorsMessage] = useState();
  const [userData, setUserData] = useState([]);
  const [isLodding, setIsLodding] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Add User Function
  const [formData, setFormData] = useState({
    name: "",
    initial: "",
    email: "",
    username: "",
    password: "",
    hiring_year: "",
    role: 4,
    allowed_vacation: 0,
    user_status: 1,
    create_by: null,
    update_by: null,
  });

  const [hiringDay, setHiringDay] = useState("");
  const [hiringMonth, setHiringMonth] = useState("");
  const [hiringYear, setHiringYear] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLodding(true);

    const hiringDate = `${hiringYear}-${hiringMonth}-${hiringDay}`;
    try {
      const res = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/add-new-user`,
        { ...formData, hiring_year: hiringDate }
      );
      closeModal();
      setFormData({
        name: "",
        initial: "",
        email: "",
        username: "",
        password: "",
        hiringDay: "",
        hiringMonth: "",
        hiringYear: "",
        role: "",
        allowed_vacation: 0,
        user_status: "",
      });
      fetchData();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error adding user:", error);
    } finally {
      setIsLodding(false);
    }
  };

  // Edit User Function

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [isEditModalOpen, userId]);

  const fetchData = () => {
    setIsLodding(true);
    AxiosAuthInstance.get(`users`)
      .then((response) => {
        setUserData(response?.data?.users);
        setIsLodding(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setIsLodding(false);
      });

    if (isEditModalOpen && userId) {
      setIsLodding(true);
      AxiosAuthInstance.get(`users/${userId}`)
        .then((response) => {
          const userData = response.data.user;
          const hiringDate = new Date(userData.hiring_year);
          // Format created_at timestamp
          const createdTimestamp = userData.created_at;
          const createdDate = new Date(createdTimestamp);
          const formattedDate = `${createdDate.getMonth() + 1
            }/${createdDate.getDate()}/${createdDate.getFullYear()}`;
          const hours = createdDate.getHours() % 12 || 12;
          const minutes = ("0" + createdDate.getMinutes()).slice(-2);
          const period = createdDate.getHours() >= 12 ? "PM" : "AM";
          const formattedTime = `${hours}:${minutes} ${period}`;
          // Format updated_at timestamp
          const updatedTimestamp = userData.updated_at;
          const updatedDate = new Date(updatedTimestamp);
          const formattedUpdatedDate = `${updatedDate.getMonth() + 1
            }/${updatedDate.getDate()}/${updatedDate.getFullYear()}`;
          const updatedHours = updatedDate.getHours() % 12 || 12;
          const updatedMinutes = ("0" + updatedDate.getMinutes()).slice(-2);
          const updatedPeriod = updatedDate.getHours() >= 12 ? "PM" : "AM";
          const formattedUpdatedTime = `${updatedHours}:${updatedMinutes} ${updatedPeriod}`;
          setFormData({
            ...formData,
            name: userData.name,
            initial: userData.initial,
            email: userData.email,
            username: userData.username,
            password: "Hidden",
            role: String(userData.role),
            allowed_vacation: userData.allowed_vacation,
            user_status: String(userData.user_status),
            creatorName: userData.creator?.name || "Unknown Creator",
            updatorName: userData.updated_by?.name || userData.creator?.name,
            hiringDay: hiringDate.getDate().toString().padStart(2, "0"),
            hiringMonth: (hiringDate.getMonth() + 1)
              .toString()
              .padStart(2, "0"),
            hiringYear: hiringDate.getFullYear().toString(),
            created_at: formattedDate,
            created_at_time: formattedTime,
            updated_at: formattedUpdatedDate,
            updated_at_time: formattedUpdatedTime,
          });
          setErrorsMessage("");
          setIsLodding(false);
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          setIsLodding(false);
        });
    }
  };

  const openEditModal = (id) => {
    setUserId(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setFormData({
      name: "",
      initial: "",
      email: "",
      username: "",
      password: "",
      hiringDay: "",
      hiringMonth: "",
      hiringYear: "",
      role: "",
      allowed_vacation: 0,
      user_status: "",
    });
    setErrorsMessage("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleEditDateChange = (setter) => (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [setter]: value,
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setErrorsMessage("");
    const hiringDateEdit = `${formData.hiringYear
      }-${formData.hiringMonth.padStart(2, "0")}-${formData.hiringDay.padStart(
        2,
        "0"
      )}`;
    AxiosAuthInstance.post(`${Constant.BASE_URL}/users/${userId}`, {
      ...formData,
      hiring_year: hiringDateEdit,
    })
      .then((response) => {
        console.log("User updated successfully:", response.data);
        closeEditModal();
        fetchData();
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        setErrorsMessage(
          error.response?.data?.message || "An error occurred while updating the user."
        );
      });
  };
  console.log(errorMessage);
  if (isLodding) {
    return <Preloader />
  }
  return (
    <>
      <div
        className={
          isModalOpen || isEditModalOpen
            ? "h-[75px] bg-[#B4C6D9] content-center sticky top-0 z-99"
            : "h-[75px] bg-[#B4C6D9] content-center sticky top-0 z-10"
        }
      >
        <MasterNav />
      </div>
      <div className="body-content bg-[#ECECEC] pb-16">
        <div className="w-[1165px] mx-auto py-3">
          <div className="administration mt-[35px] mb-5 bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex">
            <p className="mx-auto inter-medium text-[24px] ps-44">
              Administration
            </p>

            <button
              className="ms-end border-2 w-[175px] h-[40px] rounded-md border-none bg-white inter-medium text-[18px] hover:bg-[#657E98] hover:text-white"
              id="popupUser"
              onClick={openModal}
            >
              Add New User
            </button>
          </div>
        </div>
        <div className="w-[1200px] 2xl:w-[1400px] mx-auto py-3">
          <div className="bg-white w-100 p-10 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              {userData.map((user, idx) => (
                <div
                  key={idx}
                  className={`grid-item flex py-4 rounded-md justify-between items-center px-5 ${user.user_status === 0
                    ? "inactive"
                    : user.user_status === 1
                      ? "active-user"
                      : ""
                    }`}
                >
                  <h1 className="inter-bold text-[22px] w-[200px]">
                    {user.name}
                  </h1>
                  <p
                    className={`me-auto text-[18px] pt-1 ${user.user_status === 0 ? "text-[#CCCCCC]" : ""
                      }`}
                  >
                    {user.role === 1
                      ? "Administrator"
                      : user.role === 2
                        ? "CEO"
                        : user.role === 3
                          ? "Physician"
                          : "Staff"}
                  </p>

                  <Link to="#" onClick={() => openEditModal(user.id)}>
                    <div
                      className={`icon border-2 p-2 text-white rounded-lg ${user.user_status !== 1 ? "bg-[#CCCCCC]" : ""
                        }`}
                    >
                      <img src="/assets/images/Group 222.svg" alt="Edit Icon" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modals fixed inset-0 flex items-center justify-center z-50">
          <div className="modal absolute pos-modal bg-white w-[1170px] mx-auto rounded-xl">
            <form onSubmit={handleSubmit}>
              <div className="add my-5 w-[80%] h-[75px] absolute pos-auto bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex">
                <p className="mx-auto inter-medium text-[24px] ps-28">
                  Add User
                </p>
                <button
                  type="submit"
                  className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                >
                  <FontAwesomeIcon icon={faCheck} size="xl" />
                </button>
                <button
                  type="button"
                  className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-black rounded-md bg-[#D8ADAD] mx-2"
                  onClick={closeModal}
                >
                  <FontAwesomeIcon icon={faTimes} size="xl" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-12">
                <div className="grid-item special">
                  <div className="grid grid-cols-[77%_20%] gap-4">
                    <div className="full-widths pt-2 name">
                      <label htmlFor="name">Name</label>
                      <br />
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                      />
                      {errors && errors.name && (
                        <p className="text-red-800">
                          <small>{errors.name[0]}</small>
                        </p>
                      )}
                    </div>
                    <div className="full-widths pt-3 ini">
                      <label htmlFor="initial">Initials</label>
                      <br />
                      <input
                        type="text"
                        id="initial"
                        name="initial"
                        value={formData.initial}
                        onChange={handleChange}
                        placeholder="AA"
                        required
                      />
                      {errors && errors.initial && (
                        <p className="text-red-800">
                          <small>{errors.initial[0]}</small>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                    />
                    {errors && errors.email && (
                      <p className="text-red-800">
                        <small>{errors.email[0]}</small>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-2">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Username"
                      required
                    />
                    {errors && errors.username && (
                      <p className="text-red-800">
                        <small>{errors.username[0]}</small>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-2">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                    />
                    {errors && errors.password && (
                      <p className="text-red-800">
                        <small>{errors.password[0]}</small>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widthsp pt-2">
                    <label htmlFor="hiring_year">Hiring Date</label>
                    <br />
                    <div className="full-widthsp flex justify-between">
                      <input
                        className="w-[35%] text-center"
                        type="text"
                        name="hiringDay"
                        value={hiringDay}
                        onChange={handleDateChange(setHiringDay)}
                        placeholder="Day"
                      />
                      {errors && errors.hiringDay && (
                        <p className="text-red-800">
                          <small>{errors.hiringDay[0]}</small>
                        </p>
                      )}
                      <input
                        className="w-[35%] text-center"
                        type="text"
                        name="hiringMonth"
                        value={hiringMonth}
                        onChange={handleDateChange(setHiringMonth)}
                        placeholder="Month"
                      />
                      {errors && errors.hiringMonth && (
                        <p className="text-red-800">
                          <small>{errors.hiringMonth[0]}</small>
                        </p>
                      )}
                      <input
                        className="w-[35%] text-center"
                        type="text"
                        name="hiringYear"
                        value={hiringYear}
                        onChange={handleDateChange(setHiringYear)}
                        placeholder="Year"
                      />
                      {errors && errors.hiringYear && (
                        <p className="text-red-800">
                          <small>{errors.hiringYear[0]}</small>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-1">
                    <label htmlFor="role">Role</label>
                    <br />
                    <div className="mt-2">
                      <span className="pe-4">
                        <input
                          id="ceo"
                          type="radio"
                          name="role"
                          value="2"
                          onChange={handleChange}
                          checked={formData.role === "2"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="ceo"
                        >
                          CEO
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="admin"
                          type="radio"
                          name="role"
                          value="1"
                          onChange={handleChange}
                          checked={formData.role === "1"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="admin"
                        >
                          Administrator
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="surgeon"
                          type="radio"
                          name="role"
                          value="3"
                          onChange={handleChange}
                          checked={formData.role === "3"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="surgeon"
                        >
                          Surgeon
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="staff"
                          type="radio"
                          name="role"
                          value="4"
                          onChange={handleChange}
                          checked={formData.role === "4"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="staff"
                        >
                          Staff
                        </label>
                      </span>
                      {errors && errors.role && (
                        <p className="text-red-800">
                          <small>{errors.role[0]}</small>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widthsp pt-2">
                    <label htmlFor="allowed_vacation" className="space">
                      Allowed Vacation Time
                    </label>
                    <input
                      className="w-25 ps-5 text-center"
                      type="number"
                      name="allowed_vacation"
                      value={formData.allowed_vacation}
                      onChange={handleChange}
                      required
                      id="ini"
                      placeholder="00"
                    />
                    <label className="ps-2">Days</label>
                    {errors && errors.allowed_vacation && (
                      <p className="text-red-800">
                        <small>{errors.allowed_vacation[0]}</small>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-1">
                    <label htmlFor="user_status">Status</label>
                    <br />
                    <div className="mt-2">
                      <span className="pe-4">
                        <input
                          id="active"
                          type="radio"
                          name="user_status"
                          value="1"
                          onChange={handleChange}
                          checked={formData.user_status === "1"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="active"
                        >
                          Active
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="inactive"
                          type="radio"
                          name="user_status"
                          value="0"
                          onChange={handleChange}
                          checked={formData.user_status === "0"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="inactive"
                        >
                          Inactive
                        </label>
                      </span>
                      {errors && errors.user_status && (
                        <p className="text-red-800">
                          <small>{errors.user_status[0]}</small>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modals fixed inset-0 flex items-center justify-center z-50">
          <div className="modal absolute pos-modal bg-white w-[1170px] mx-auto rounded-xl">
            <form onSubmit={handleEditSubmit}>
              <div className="add my-5 w-[80%] h-[75px] absolute pos-auto bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex">
                <p className="mx-auto inter-medium text-[24px] ps-28">
                  Edit User
                </p>
                <button
                  type="submit"
                  className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#657E98] hover:text-white rounded-md bg-[#B4C6D9] mx-2"
                >
                  <FontAwesomeIcon icon={faCheck} size="xl" />
                </button>
                <button
                  type="button"
                  className="ms-end border-2 border-white h-[35px] w-[35px] hover:bg-[#B87D7D] hover:text-black rounded-md bg-[#D8ADAD] mx-2"
                  onClick={closeEditModal}
                >
                  <FontAwesomeIcon icon={faTimes} size="xl" />
                </button>
              </div>
              <div className="pt-12 flex items-center justify-center">
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-12 py-5">
                <div className="grid-item special">
                  <div className="grid grid-cols-[77%_20%] gap-4">
                    <div className="full-widths pt-2 name">
                      <label htmlFor="name">Names</label>
                      <br />
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleEditChange}
                        placeholder="Name"
                        required
                      />
                      <p className="text-danger">
                        <small>
                          {" "}
                          {errors.name !== undefined
                            ? errors.name[0]
                            : null}{" "}
                        </small>
                      </p>
                    </div>
                    <div className="full-widths pt-3 ini">
                      <label htmlFor="initial">Initials</label>
                      <br />
                      <input
                        type="text"
                        id="initial"
                        name="initial"
                        value={formData.initial}
                        onChange={handleEditChange}
                        placeholder="AA"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleEditChange}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-2">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleEditChange}
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-2">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleEditChange}
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widthsp pt-2">
                    <label htmlFor="hiring_year">Hiring Date</label>
                    <br />
                    <div className="full-widthsp flex justify-between">
                      <input
                        className="w-[35%] text-center"
                        type="text"
                        name="hiringDay"
                        value={formData.hiringDay}
                        onChange={handleEditChange}
                        placeholder="Day"
                      />
                      <input
                        className="w-[35%] text-center"
                        type="text"
                        name="hiringMonth"
                        value={formData.hiringMonth}
                        onChange={handleEditChange}
                        placeholder="Month"
                      />
                      <input
                        className="w-[35%] text-center"
                        type="text"
                        name="hiringYear"
                        value={formData.hiringYear}
                        onChange={handleEditChange}
                        placeholder="Year"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-1">
                    <label htmlFor="role">Role</label>
                    <br />
                    <div className="mt-2">
                      <span className="pe-4">
                        <input
                          id="ceo"
                          type="radio"
                          name="role"
                          value="2"
                          onChange={handleEditChange}
                          checked={formData.role === "2"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="ceo"
                        >
                          CEO
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="admin"
                          type="radio"
                          name="role"
                          value="1"
                          onChange={handleEditChange}
                          checked={formData.role === "1"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="admin"
                        >
                          Administrator
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="surgeon"
                          type="radio"
                          name="role"
                          value="3"
                          onChange={handleEditChange}
                          checked={formData.role === "3"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="surgeon"
                        >
                          Surgeon
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="staff"
                          type="radio"
                          name="role"
                          value="4"
                          onChange={handleEditChange}
                          checked={formData.role === "4"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="staff"
                        >
                          Staff
                        </label>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widthsp pt-2">
                    <label htmlFor="allowed_vacation" className="space">
                      Allowed Vacation Time
                    </label>
                    <input
                      className="w-25 ps-5 text-center overflow-hidden"
                      type="number"
                      name="allowed_vacation"
                      value={formData.allowed_vacation}
                      onChange={handleEditChange}
                      required
                      id="ini"
                      placeholder="00"
                    />
                    <label className="ps-2">Days</label>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-1">
                    <label htmlFor="user_status">Status</label>
                    <br />
                    <div className="mt-2">
                      <span className="pe-4">
                        <input
                          id="active"
                          type="radio"
                          name="user_status"
                          value="1"
                          onChange={handleEditChange}
                          checked={formData.user_status === "1"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="active"
                        >
                          Active
                        </label>
                      </span>
                      <span className="pe-4">
                        <input
                          id="inactive"
                          type="radio"
                          name="user_status"
                          value="0"
                          onChange={handleEditChange}
                          checked={formData.user_status === "0"}
                        />{" "}
                        <label
                          style={{ fontWeight: "400", fontSize: "17px" }}
                          htmlFor="inactive"
                        >
                          Inactive
                        </label>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-1">
                    <span className="pe-4">
                      <strong>User Created By:</strong>
                    </span>
                    <span className="px-3">{formData.creatorName}</span>
                    <span className="px-3">{formData.created_at}</span>
                    <span className="px-3">{formData.created_at_time}</span>
                  </div>
                </div>
                <div className="grid-item">
                  <div className="full-widths pt-1">
                    <span className="pe-4">
                      <strong>Last Update By:</strong>
                    </span>
                    {formData.update_by !== "" ? (
                      <>
                        <span className="px-3">{formData.updatorName}</span>
                        <span className="px-3">{formData.updated_at}</span>
                        <span className="px-3">{formData.updated_at_time}</span>
                      </>
                    ) : (
                      <>
                        <span className="px-3">{formData.creatorName}</span>
                        <span className="px-3">{formData.updated_at}</span>
                        <span className="px-3">{formData.updated_at_time}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Administration;
