const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,

  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) throw err;
})

const promptMessages = {
  viewAllEmployees: "View All Employees",
  viewByDepartment: "View All Employees By Department",
  viewByManager: "View All Employees By Manager",
  addEmployee: "Add An Employee",
  removeEmployee: "Remove An Employee",
  updateRole: "Update Employee Role",
  updateEmployeeManager: "Update Employee Manager",
  viewAllRoles: "View All Roles",
  exit: "Exit"
};

function prompt() {
  inquirer  
    .prompt({
      name: 'action',
      type: 'list',
      message: "What would you like to do?",
        choices: [
          promptMessages.viewAllEmployees,
          promptMessages.viewByDepartment,
          promptMessages.viewByManager,
          promptMessages.viewAllRoles,
          promptMessages.addEmployee,
          promptMessages.removeEmployee,
          promptMessages.updateRole,
          promptMessages.exit,
        ]
    })
    .then(answers => {
      console.log('answer', answers);
      switch (answers.action) {
        case promptMessages.viewAllEmployees:
            viewAllEmployees();
            break;
        
        case promptMessages.viewByDepartment:
            viewByDepartment();
            break;
    }})
}

function viewAllEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id)
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY employee.id;`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.log(res);
      console.log('\n');
      console.log('VIEW ALL EMPLOYEES');
      console.log('\n');
      console.table(res);
      prompt();
  });
}

function viewByDepartment() {
  const query = `SELECT department.name AS department, role.title, employee.id, employee.first_name, employee.last_name
    FROM employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    ORDER BY department.name;`;
      connection.query(query, (err, res) => {
        if(err) throw err;
        console.log('/n');
        console.log('View Employee by Department');
        console.log('/n');
        console.table(res);
        prompt();
      });
}

prompt();

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
