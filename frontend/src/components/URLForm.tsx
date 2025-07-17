import React, { useState } from 'react';
import { apiFetch } from '../api';

interface Url {
  slug: string;
  longUrl: string;
}

interface Props {
  onCreated: (url: Url) => void;
}

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const URLForm: React.FC<Props> = ({ onCreated }) => {
  const [longUrl, setLongUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(longUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const body: Record<string, string> = { longUrl };
      if (slug) body.slug = slug;
      const res = await apiFetch('http://localhost:3000/urls', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create URL');
      }
      const data = await res.json();
      onCreated(data);
      setLongUrl('');
      setSlug('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium" htmlFor="longUrl">
          Long URL
        </label>
        <input
          id="longUrl"
          type="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium" htmlFor="slug">
          Custom Slug (optional)
        </label>
        <input
          id="slug"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Shorten URL'}
      </button>
    </form>
  );
};

export default URLForm;
