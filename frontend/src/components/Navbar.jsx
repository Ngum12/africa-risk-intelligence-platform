import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-white">Africa Risk Intelligence</div>
        <div className="space-x-4">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => 
              `px-3 py-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-gray-700'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/predict" 
            className={({ isActive }) => 
              `px-3 py-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-gray-700'}`
            }
          >
            Predict
          </NavLink>
          <NavLink 
            to="/retrain" 
            className={({ isActive }) => 
              `px-3 py-2 rounded ${isActive ? 'bg-blue-700' : 'hover:bg-gray-700'}`
            }
          >
            Retrain Model
          </NavLink>
        </div>
      </div>
    </nav>
  );
}