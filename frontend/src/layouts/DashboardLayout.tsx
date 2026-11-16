import {Outlet} from "react-router"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
const DashboardLayout = () =>{
    return (<div>
       <header>
        <Header />
       </header>
       <aside>
        <Sidebar />
       </aside>
       <main>
        <Outlet />
       </main>
    </div>)
}

export default DashboardLayout