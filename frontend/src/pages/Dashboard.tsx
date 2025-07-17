import React, { useEffect, useState } from 'react';
import URLForm from '../components/URLForm';
import { apiFetch, API_BASE_URL } from '../api';
import UrlItem, { Url } from '../components/UrlItem';
import Button from '../components/ui/Button';


const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Url | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCreated = async () => {
    if (created) {
      try {
        await navigator.clipboard.writeText(`${API_BASE_URL}/${created.slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const fetchUrls = async () => {
    try {
      const res = await apiFetch('/urls');
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
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700 mb-2">
            Short URL created successfully!
          </p>
          <div className="flex items-center justify-between">
            <a
              href={`${API_BASE_URL}/${created.slug}`}
              className="text-blue-600 underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${API_BASE_URL}/${created.slug}`}
            </a>
            <Button
              type="button"
              onClick={handleCopyCreated}
              className="ml-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
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
