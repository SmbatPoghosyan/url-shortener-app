import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { apiFetch } from '../api';

export interface Url {
  id: string;
  slug: string;
  longUrl: string;
}

interface Props {
  url: Url;
  onUpdate: (url: Url) => void;
  onDelete: (id: string) => void;
}

const UrlItem: React.FC<Props> = ({ url, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [slug, setSlug] = useState(url.slug);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`http://localhost:3000/urls/${url.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update');
      }
      const data = await res.json();
      onUpdate(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`http://localhost:3000/urls/${url.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete');
      }
      onDelete(url.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex flex-col rounded-md bg-white p-3 shadow gap-2">
      {isEditing ? (
        <div className="space-y-2">
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
            <Button
              type="button"
              className="bg-gray-500 hover:bg-gray-500/90"
              onClick={() => {
                setIsEditing(false);
                setSlug(url.slug);
                setError('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <span>
            <a
              href={url.longUrl}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {url.longUrl}
            </a>
          </span>
          <a
            href={`http://localhost:3000/${url.slug}`}
            className="text-sm text-gray-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {`http://localhost:3000/${url.slug}`}
          </a>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-600/90"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </li>
  );
};

export default UrlItem;
