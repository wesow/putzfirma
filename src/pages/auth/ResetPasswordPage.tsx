import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Kein Token gefunden. Bitte klicke erneut auf den Link in der E-Mail.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Passwort erfolgreich geändert! Du wirst gleich weitergeleitet...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Fehler beim Zurücksetzen.');
      }
      
    } catch (err) {
      setError('Server-Fehler. Bitte später versuchen.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded shadow text-center text-red-600">
          Ungültiger Link. Bitte fordere das Passwort erneut an.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Neues Passwort setzen</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded border border-green-200">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Neues Passwort</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Passwort wiederholen</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Speichern...' : 'Passwort ändern'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
             <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">Abbrechen</Link>
        </div>
      </div>
    </div>
  );
}