import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, User, Hash } from 'lucide-react';
import api from '../../lib/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  personnelNumber: string;
}

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team & Mitarbeiter</h1>
          <p className="text-slate-500">Verwalte dein Reinigungspersonal</p>
        </div>
        <Link 
          to="/dashboard/team/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Mitarbeiter anlegen
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Team...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {employee.firstName} {employee.lastName}
                </h3>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Hash className="h-3 w-3" />
                  <span>PNR: {employee.personnelNumber}</span>
                </div>
              </div>
            </div>
          ))}
          
          {employees.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Noch keine Mitarbeiter angelegt.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}