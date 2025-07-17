import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex gap-4 p-4 bg-white shadow">
      <Link className="font-semibold" to="/">
        Home
      </Link>
      {token ? (
        <>
          <Link className="hover:underline" to="/dashboard">
            Dashboard
          </Link>
          <button
            className="ml-auto text-red-600 hover:underline"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link className="hover:underline" to="/login">
            Login
          </Link>
          <Link className="hover:underline" to="/signup">
            Signup
          </Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;
