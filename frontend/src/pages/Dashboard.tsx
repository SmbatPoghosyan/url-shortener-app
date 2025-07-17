import React, { useEffect, useState } from 'react';
import URLForm from '../components/URLForm';
import { apiFetch } from '../api';
import UrlItem, { Url } from '../components/UrlItem';


const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Url | null>(null);

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
    setCreated(url);
  };

  const handleUpdate = (updated: Url) => {
    setUrls((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleDelete = (id: string) => {
    setUrls((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <URLForm onCreated={handleCreated} />
      {created && (
        <p className="text-green-700">
          Short URL created:{' '}
          <a
            href={`http://localhost:3000/${created.slug}`}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {`http://localhost:3000/${created.slug}`}
          </a>
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {urls.map((u) => (
          <UrlItem
            key={u.id}
            url={u}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
