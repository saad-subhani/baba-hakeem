import AdminSidebar from '../../components/AdminSidebar';
import './admin.css';
import './admin-design.css';

export const metadata={robots:{index:false,follow:false}};
export default function AdminLayout({children}){
  return <div id="baba-admin-root"><div className="admin-shell"><AdminSidebar/><div className="admin-shell-main">{children}</div></div></div>;
}
