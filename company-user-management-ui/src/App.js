import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
});

const centerDefault = { lat: 20, lng: 0 };

function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  const [newCompany, setNewCompany] = useState({ name: '', address: '' });
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    designation: '',
    active: true,
  });

  const [migrateUserId, setMigrateUserId] = useState(null);
  const [migrateToCompanyId, setMigrateToCompanyId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/companies')
      .then(res => {
        setCompanies(res.data);
        setLoadingCompanies(false);
      })
      .catch(() => {
        setError('Failed to load companies.');
        setLoadingCompanies(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      setLoadingUsers(true);
      axios.get('http://localhost:5000/api/users')
        .then(res => {
          const filteredUsers = res.data.filter(u => u.company_id === selectedCompany.id);
          setUsers(filteredUsers);
          setLoadingUsers(false);
        })
        .catch(() => {
          setUsers([]);
          setLoadingUsers(false);
        });
    } else {
      setUsers([]);
    }
  }, [selectedCompany]);

  const handleCreateCompany = () => {
    if (!newCompany.name.trim() || !newCompany.address.trim()) {
      setError('Please provide company name and address.');
      return;
    }
    axios.post('http://localhost:5000/api/companies', newCompany)
      .then(res => {
        setCompanies([...companies, res.data]);
        setNewCompany({ name: '', address: '' });
        setError(null);
      })
      .catch(() => {
        setError('Failed to create company.');
      });
  };

  const handleDeleteCompany = (companyId) => {
    axios.delete(`http://localhost:5000/api/companies/${companyId}`)
      .then(() => {
        setCompanies(companies.filter(company => company.id !== companyId));
        if (selectedCompany && selectedCompany.id === companyId) {
          setSelectedCompany(null);
        }
        setError(null);
      })
      .catch(() => {
        setError('Failed to delete company. Ensure it has no users associated.');
      });
  };

  const handleCreateUser = () => {
    if (!newUser.first_name.trim() || !newUser.last_name.trim() || !newUser.email.trim()) {
      setError('Please provide first name, last name, and email.');
      return;
    }
    axios.post('http://localhost:5000/api/users', { ...newUser, company_id: selectedCompany.id })
      .then(() => {
        axios.get('http://localhost:5000/api/users')
          .then(resp => {
            const filtered = resp.data.filter(u => u.company_id === selectedCompany.id);
            setUsers(filtered);
            setNewUser({
              first_name: '',
              last_name: '',
              email: '',
              designation: '',
              active: true,
            });
            setError(null);
          });
      })
      .catch(() => {
        setError('Failed to create user.');
      });
  };

  const handleDeleteUser = (userId) => {
    axios.delete(`http://localhost:5000/api/users/${userId}`)
      .then(() => {
        setUsers(users.filter(user => user.id !== userId));
        setError(null);
        // If deleting user who is selected for migration, reset migration state
        if (migrateUserId === userId) {
          setMigrateUserId(null);
          setMigrateToCompanyId(null);
        }
      })
      .catch(() => {
        setError('Failed to delete user.');
      });
  };

  const handleMigrateUser = () => {
    if (!migrateUserId || !migrateToCompanyId) {
      setError('Select user and target company for migration.');
      return;
    }
    axios.put(`http://localhost:5000/api/users/${migrateUserId}`, { company_id: Number(migrateToCompanyId) })
      .then(() => {
        axios.get('http://localhost:5000/api/users')
          .then(resp => {
            const filtered = resp.data.filter(u => u.company_id === selectedCompany.id);
            setUsers(filtered);
            setMigrateUserId(null);
            setMigrateToCompanyId(null);
            setError(null);
          });
      })
      .catch(() => {
        setError('Failed to migrate user.');
      });
  };

  // Helper to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return (
      typeof lat === 'number' && isFinite(lat) &&
      typeof lng === 'number' && isFinite(lng) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  };

  // Parse latitude and longitude safely
  const parseCoordinates = () => {
    if (!selectedCompany) return null;
    const lat = parseFloat(selectedCompany.latitude);
    const lng = parseFloat(selectedCompany.longitude);
    if (isValidCoordinate(lat, lng)) {
      return { lat, lng };
    }
    return null;
  };

  const companyCoords = parseCoordinates();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Company & User Management</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Create Company */}
      <section style={{ marginBottom: 20 }}>
        <h2>Create Company</h2>
        <input
          type="text"
          placeholder="Company Name"
          value={newCompany.name}
          onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Company Address"
          value={newCompany.address}
          onChange={e => setNewCompany({ ...newCompany, address: e.target.value })}
          style={{ marginRight: 10 }}
        />
        <button onClick={handleCreateCompany}>Add Company</button>
      </section>

      {/* Companies List */}
      <section>
        <h2>Companies</h2>
        {loadingCompanies ? (
          <p>Loading companies...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {companies.map(company => (
              <li
                key={company.id}
                style={{
                  marginBottom: '6px',
                  padding: '8px',
                  backgroundColor: selectedCompany?.id === company.id ? '#d0e6ff' : '#f5f5f5',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  onClick={() => setSelectedCompany(company)}
                  style={{ cursor: 'pointer', flexGrow: 1 }}
                >
                  {company.name}
                </span>
                <button
                  onClick={() => handleDeleteCompany(company.id)}
                  style={{ marginLeft: 10 }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Selected Company Details */}
      {selectedCompany && (
        <section style={{ marginTop: 40 }}>
          <h2>Company Details</h2>
          <p><strong>Name:</strong> {selectedCompany.name}</p>
          <p><strong>Address:</strong> {selectedCompany.address}</p>

          {/* Render map only if valid coordinates exist */}
          {companyCoords ? (
            <MapContainer
              center={companyCoords}
              zoom={15}
              style={{ height: '400px', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={companyCoords}>
                <Popup>{selectedCompany.name}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p style={{ color: 'orange' }}>Location coordinates are not available or invalid for this company.</p>
          )}

          {/* Create User */}
          <div style={{ marginTop: 30 }}>
            <h3>Create User</h3>
            <input
              type="text"
              placeholder="First Name"
              value={newUser.first_name}
              onChange={e => setNewUser({ ...newUser, first_name: e.target.value })}
              style={{ marginRight: 10 }}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newUser.last_name}
              onChange={e => setNewUser({ ...newUser, last_name: e.target.value })}
              style={{ marginRight: 10 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              style={{ marginRight: 10 }}
            />
            <input
              type="text"
              placeholder="Designation"
              value={newUser.designation}
              onChange={e => setNewUser({ ...newUser, designation: e.target.value })}
              style={{ marginRight: 10 }}
            />
            <label style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={newUser.active}
                onChange={e => setNewUser({ ...newUser, active: e.target.checked })}
              /> Active
            </label>
            <button onClick={handleCreateUser}>Add User</button>
          </div>

          {/* Users List */}
          <div style={{ marginTop: 30 }}>
            <h3>Users</h3>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : users.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map(user => (
                  <li
                    key={user.id}
                    style={{
                      marginBottom: '6px',
                      padding: '6px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {user.first_name} {user.last_name} - {user.designation || 'No designation'} {user.active ? '(Active)' : '(Inactive)'}
                    </span>
                    <div>
                      <button
                        onClick={() => {
                          setMigrateUserId(user.id);
                          setMigrateToCompanyId('');
                        }}
                        style={{ marginRight: 10 }}
                      >
                        Migrate
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ backgroundColor: '#ff4d4f', color: 'white' }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users found for this company.</p>
            )}
          </div>

          {/* User Migration */}
          {migrateUserId && (
            <div style={{ marginTop: 20 }}>
              <h4>Migrate User to Another Company</h4>
              <select onChange={e => setMigrateToCompanyId(e.target.value)} value={migrateToCompanyId || ''}>
                <option value="">Select Company</option>
                {companies.filter(c => c.id !== selectedCompany.id).map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <button onClick={handleMigrateUser} style={{ marginLeft: 10 }}>
                Confirm Migration
              </button>
              <button
                onClick={() => {
                  setMigrateUserId(null);
                  setMigrateToCompanyId(null);
                }}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;

