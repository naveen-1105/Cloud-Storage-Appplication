import { useEffect, useState } from "react";
import "./UsersPage.css";
import { BASE_URL } from "./components/DirectoryHeader";
import { useNavigate } from "react-router-dom";

export default function AdminUsersPage() {
  async function fetchUser() {
      try {
        const response = await fetch(`${BASE_URL}/user`, {
          credentials: "include",
        });
        if (response.ok) {
          const user = await response.json();
          setAppUser(user);
          console.log(user.role);
        }
        else if( response.status === 401){
            navigate("/login")
        }else {
          // Handle other error statuses if needed
          console.error("Error fetching users data", response.status);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }
  async function fetchUsers() {
      try {
        const response = await fetch(`${BASE_URL}/user/get-all-users`, {
          credentials: "include",
        });
        if (response.ok) {
          const {users} = await response.json();
          setUsers(users);
          console.log(users);
        }
        else if( response.status === 401){
            navigate("/login")
        }else if( response.status === 403){
            navigate("/")
            alert("You are not authorized to see all the users in aour application")
        } else {
          // Handle other error statuses if needed
          console.error("Error fetching users data", response.status);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }
  const [users, setUsers] = useState([]);
  const [appUser, setAppUser] = useState({});
  const navigate = useNavigate()

  const logoutUser = async(userId) => {
    await fetch(`${BASE_URL}/user/logout/${userId}`, {
      method: "POST",
      credentials: "include",
    })
    fetchUsers()
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isLoggedIn: false } : user
      )
    );
  };
  const deleteUser = async(userId) => {
    try {
      await fetch(`${BASE_URL}/user/delete-user/${userId}`, {
        method: "POST",
        credentials: "include",
      })
      fetchUsers()
      setUsers((prevUsers) =>
        prevUsers.filter((user) =>
          user._id !== userId
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUser()
  }, []);

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Logout</th>
            {appUser.role === 'admin' && <th>Delete User</th>} {/* Conditionally render header */}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => logoutUser(user._id)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>
              {appUser.role === 'admin' && 
                <td>
                  <button
                    className="delete-button"
                    onClick={() => deleteUser(user._id)}
                    disabled={!user}
                  >
                    Delete User
                  </button>
                </td>
              }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
