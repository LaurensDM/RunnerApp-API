const mysql = require('mysql');

// Create a connection pool
const pool = mysql.createPool({
    host: 'your_database_host',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name',
});


// Function to execute SQL queries
// function executeQuery(query: any, params?: any): any {
//     return new Promise((resolve, reject) => {
//         pool.getConnection((err, connection) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             connection.query(query, params, (error, results) => {
//                 connection.release();

//                 if (error) {
//                     reject(error);
//                     return;
//                 }

//                 resolve(results);
//             });
//         });
//     });
// }

// // CRUD operations

// // Create a new record
// async function createRecord(data) {
//     const query = 'INSERT INTO your_table_name SET ?';
//     const result = await executeQuery(query, data);
//     return result.insertId;
// }

// // Read all records
// async function getAllRecords() {
//     const query = 'SELECT * FROM your_table_name';
//     const result = await executeQuery(query);
//     return result;
// }

// // Read a single record by ID
// async function getRecordById(id) {
//     const query = 'SELECT * FROM your_table_name WHERE id = ?';
//     const result = await executeQuery(query, id);
//     return result[0];
// }

// // Update a record by ID
// async function updateRecordById(id, data) {
//     const query = 'UPDATE your_table_name SET ? WHERE id = ?';
//     const result = await executeQuery(query, [data, id]);
//     return result.affectedRows > 0;
// }

// // Delete a record by ID
// async function deleteRecordById(id) {
//     const query = 'DELETE FROM your_table_name WHERE id = ?';
//     const result = await executeQuery(query, id);
//     return result.affectedRows > 0;
// }

// module.exports = {
//     createRecord,
//     getAllRecords,
//     getRecordById,
//     updateRecordById,
//     deleteRecordById,
// };