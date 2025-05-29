import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-moss via-sage to-sand">
      <div className="fixed inset-y-0 left-0">
        <Sidebar />
      </div>
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}