const ManageTasks = () => {
    return (<>
    
     <section>
        <h2>Manage Tasks</h2>
        <table>
            <thead>
            <tr>
                <th>Task Title</th>
                 <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Design Login UI</td>
                      <td>John</td>
                    <td>High</td>
                    <td>In Progress</td>
                    <td>20 Nov</td>
                      <td>
                         <button type="button">Edit</button>
                        <button type="button">Delete</button>
                      </td>
                </tr>
                <tr>
                    <td>API Integration</td>
                      <td>Alex</td>
                    <td>Medium</td>
                    <td>Pending</td>
                    <td>22 Nov</td>
                        <td>
                         <button type="button">Edit</button>
                        <button type="button">Delete</button>
                      </td>
                </tr>
                </tbody>
            </table>     
      </section>
    </>)
} 

export default ManageTasks