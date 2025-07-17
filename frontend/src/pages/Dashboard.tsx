import React, { useEffect, useState } from 'react';
import URLForm from '../components/URLForm';
import { apiFetch } from '../api';

interface Url {
  slug: string;
  target: string;
}

const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState('');

  const fetchUrls = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/urls');
      if (!res.ok) {
        throw new Error('Failed to load URLs');
      }
      const data = await res.json();
      setUrls(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreated = (url: Url) => {
    setUrls((prev) => [url, ...prev]);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <URLForm onCreated={handleCreated} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {urls.map((u) => (
          <li key={u.slug}>
            <a href={u.target} target="_blank" rel="noopener noreferrer">
              {u.target}
            </a>{' '}
            -{' '}
            <a
              href={`http://localhost:3000/${u.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`http://localhost:3000/${u.slug}`}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
