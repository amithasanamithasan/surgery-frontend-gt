import React, { useRef, useState, useEffect } from "react";
import Breadcrumb from "../Partials/Breadcrumb";
import { AxiosAuthInstance } from "../../AxiosInterceptors";

const Profile = () => {
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLodding, setIsLodding] = useState(false);
  const userRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLodding(true);
    AxiosAuthInstance.post(`user_profile_update`, {
      name: e.currentTarget.name.value,
      email: e.currentTarget.email.value,
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    }).then(
      (response) => {
        if (response.data.status === true) {
          userRef.current.value = "";
          setIsLodding(false);
        }
      },
      (error) => {
        setIsLodding(false);
        setErrors(error.response.data.errors);
      }
    );
  };

  useEffect(() => {
    AxiosAuthInstance.post(`user_profile`).then((response) => {
      setData(response?.data?.user);
    });
  }, []);

  return (
    <>
      <Breadcrumb title={"Edit Profile"} />
      <div className="row">
        <div className="col-md-4">
          <div className="card custom-bg text-white">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4> Edit Profile </h4>
              </div>
            </div>
            <div className="card-body bg-white">
              {/* category_name, category_slug, category_code, category_status, create_by, update_by, create_at, update_at */}
              <div className="row">
                <form onSubmit={(e) => handleSubmit(e)} method="post">
                  <div className="col-md-12">
                    <label htmlFor="name w-100">
                      <p className="text-dark"> Name </p>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={data?.name}
                      className={
                        errors.name !== undefined
                          ? "form-control mb-4 is-invalid"
                          : "form-control mb-4"
                      }
                      placeholder="Enter Name"
                    />
                    <p className="text-danger">
                      <small>
                        {" "}
                        {errors.name !== undefined ? errors.name[0] : null}{" "}
                      </small>
                    </p>
                  </div>

                  <div className="col-md-12">
                    <label htmlFor="email w-100">
                      <p className="text-dark"> Email Address </p>
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={data?.email}
                      className={
                        errors.email !== undefined
                          ? "form-control mb-4 is-invalid"
                          : "form-control mb-4"
                      }
                      placeholder="Enter Email Address"
                    />
                    <p className="text-danger">
                      <small>
                        {" "}
                        {errors.email !== undefined
                          ? errors.email[0]
                          : null}{" "}
                      </small>
                    </p>
                  </div>

                  <div className="col-md-12">
                    <label htmlFor="username w-100">
                      <p className="text-dark"> Phone Number </p>
                    </label>
                    <input
                      type="tel"
                      name="username"
                      defaultValue={data?.username}
                      className={
                        errors.username !== undefined
                          ? "form-control mb-4 is-invalid"
                          : "form-control mb-4"
                      }
                      placeholder="Enter username "
                    />
                    <p className="text-danger">
                      <small>
                        {" "}
                        {errors.username !== undefined
                          ? errors.username[0]
                          : null}{" "}
                      </small>
                    </p>
                  </div>

                  <div className="col-md-12">
                    <label htmlFor="password w-100">
                      <p className="text-dark"> Password </p>
                    </label>
                    <input
                      type="password"
                      name="password"
                      ref={userRef}
                      minLength="8"
                      className={
                        errors.password !== undefined
                          ? "form-control mb-4 is-invalid"
                          : "form-control mb-4"
                      }
                      placeholder="Enter Password"
                    />
                    <p className="text-danger">
                      <small>
                        {" "}
                        {errors.password !== undefined
                          ? errors.password[0]
                          : null}{" "}
                      </small>
                    </p>
                  </div>

                  <div className="col-md-12 my-4">
                    <button
                      type="submit"
                      className="btn custom-bg text-white btn-md"
                      dangerouslySetInnerHTML={{
                        __html: isLodding
                          ? '<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...'
                          : "Edit Profile",
                      }}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
