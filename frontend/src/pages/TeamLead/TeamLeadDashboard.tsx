import "./TeamLeadDashboard.css"

const TeamLeadDashboard =() =>{
 
return (<><h1>Team Lead Dashboard 1</h1>
<div className="summary-grid">
<div className="summary-card">
    <h1>Total Tasks</h1>
    <p>3</p>
    </div>
<div className="summary-card">
      <h1>Pending Tasks</h1>
    <p>4</p>
    </div>
<div className="summary-card">
      <h1>In Progress Tasks</h1>
    <p>5</p>
    </div>

<div className="summary-card">
      <h1>Completed Tasks</h1>
    <p>6</p>
    </div>
     </div>
      <section>
        <h2>Recent-Tasks</h2>
        <table>
            <thead>
            <tr>
                <th>Task Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
            </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Design Login UI</td>
                    <td>John</td>
                    <td>High</td>
                    <td>In Progress</td>
                    <td>20 Nov</td>
                </tr>
                <tr>
                    <td>API Integration</td>
                    <td>Alex</td>
                    <td>Medium</td>
                    <td>Pending</td>
                    <td>22 Nov</td>
                </tr>
                </tbody>
            </table>     
      </section>
   

</>)
        
}

export default TeamLeadDashboard
