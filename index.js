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
    viewAllDepartments: "View All Departments",
    viewAllRoles: "View All Roles",
    viewAllEmployees: "View All Employees",
    addDepartment: "Add A Department",
    addRole: "Add A Role",
    addEmployee: "Add An Employee",
    updateRole: "Update Employee Role",

    viewByDepartment: "View All Employees By Department",
    viewByManager: "View All Employees By Manager",
    removeEmployee: "Remove An Employee",
    updateEmployeeManager: "Update Employee Manager",
    exit: "Exit"
};

function prompt() {
  inquirer  
    .prompt({
      name: 'action',
      type: 'list',
      message: "What would you like to do?",
          choices: [
            promptMessages.viewAllDepartments,
            promptMessages.viewAllRoles,
            promptMessages.viewAllEmployees,
            promptMessages.addDepartment,
            promptMessages.addRole,
            promptMessages.addEmployee,
            promptMessages.updateRole,

            promptMessages.viewByManager,
            promptMessages.viewByDepartment,
            promptMessages.removeEmployee,
            promptMessages.exit,
          ]
    })
    .then(answers => {
      console.log('answer', answers);
      switch (answers.action) {
        case promptMessages.viewAllDepartments:
            showDepartments();
            break;

        case promptMessages.viewAllRoles:
            showAllRoles();
            break;

        case promptMessages.viewAllEmployees:
            showAllEmployees();
            break;
        
        case promptMessages.addDepartment:
            addDepartment();
            break;

        case promptMessages.addRole:
            addRole();
            break;

        case promptMessages.addEmployee:
            addEmployee();
            break;

        case promptMessages.updateRole:
          updateRole();
          break;

        case promptMessages.viewByManager:
          showByManager();
          break;

        case promptMessages.viewByDepartment:
            showByDepartment();
            break;

        case promptMessages.removeEmployee:
          removeEmployee();
          break;

        case promptMessages.exit:
          exit();
          break;
    }});
};

function showDepartments() {
  const query = `SELECT department.id AS id, 
                        department.name AS name 
                        FROM department`;
      connection.query(query, (err, res) => {
          if (err) throw err;
          console.log(res);
          console.log('\n');
          console.log('VIEW ALL DEPARTMENTS');
          console.log('\n');
          console.table(res);
          prompt();
      });
};

function showAllRoles() {
  const query = `SELECT role.id AS id, 
                        role.title AS title, 
                        department.name AS department, 
                        role.salary AS salary   
                        FROM role
                  INNER JOIN department ON role.department_id = department.id`;
      connection.query(query, (err, res) => {
          if (err) throw err;
          console.log(res);
          console.log('\n');
          console.log('VIEW ALL ROLES');
          console.log('\n');
          console.table(res);
          prompt();
      });
};

function showAllEmployees() {
  const query = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                        FROM employee
                  LEFT JOIN employee manager on manager.id = employee.manager_id
                  INNER JOIN role ON (role.id = employee.role_id)
                  INNER JOIN department ON (department.id = role.department_id)
                  ORDER BY employee.id;`;
      connection.query(query, (err, res) => {
          if (err) throw err;
          console.log('\n');
          console.log('VIEW ALL EMPLOYEES');
          console.log('\n');
          console.table(res);
          prompt();
      });
};

async function addDepartment () {
    inquirer.prompt([
        {
          type: 'input',
          name: 'addDept',
          message: "What department do you want to add?",
          validate: addDept => {
            if (addDept) {
              return true;
            } else {
              console.log("Please enter a department");
              return false;
            };
          }
        }
    ])
      .then(answer => {
          const query = `INSERT INTO department 
                        (name)
                        VALUES (?)`;
              connection.query(query, answer.addDept, (err, result) => {
                if (err) throw err;
                console.log("Added" + answer.addDept + "to departments");
              });

      showDepartments(); 

      });
};

async function addRole () {
    inquirer.prompt([
        {
          type: 'input',
          name: 'role',
          message: "What role do you want to add?",
          validate: addRole => {
              if (addRole) {
                return true;
              } else {
                console.log ("Please enter a role");
                return false;
              }
          }
        },
        {
          type: 'input',
          name: 'salary',
          message: "What is the salary of this role?",
          validate: addSalary => {
            if (addSalary) {
              return true;
            } else {
              console.log("Please enter a salary");
              return false;
            }
          }
        }
      ])
        .then(answer => {
            const params = [answer.role, answer.salary];

            const roleQuery = `SELECT name, id FROM department`;

            connection.query(roleQuery, async (err, data) => {
              if (err) throw err;

              const dept = data.map(({ name, id}) => ({name: name, value: id }));

              inquirer.prompt ([
                        {
                          type: 'list',
                          name: 'dept',
                          message: "What department is this role in?",
                          choices: dept
                        }
              ])
                .then(deptChoice => {
                          const dept = deptChoice.dept;
                          params.push(dept);

                          const query = `INSERT INTO role (title, salary, department_id)
                                        VALUES (?, ?, ?)`;
                              connection.query(query, params, (err, result) => {
                                if (err) throw err;
                                console.log("Added" + answer.role + "to roles");
                              });

        showAllRoles();

                });
            });
        });
};

async function addEmployee() {
  const addName = await inquirer.prompt(askName());
  connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
    if (err) throw err;
    const {role} = await inquirer.prompt([
      {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.title),
          message: "What is the employee role?: "
      }
    ]);
    let roleId;
    for (const row of res) {
      if (row.title === role) {
        roleId = row.id;
        continue;
      }
    }
    connection.query('SELECT * FROM employee', async (err, res) => {
      if (err) throw err;
      let choices = res.map(res => `${res.first_name} ${res.last_name}`);
      choices.push('none');
      let {manager} = await inquirer.prompt([
        {
          name: 'manager',
          type: 'list',
          choices: choices,
          message: "Choose the employee's manager:"
        }
      ]);
      let managerId;
      let managerName;
      if(manager === 'none') {
        managerId = 0;
      } else {
        for (const data of res) {
          data.fullName = `${data.first_name} ${data.last_name}`;
          if ( data.fullName === manager) {
            managerId = data.id;
            managerName = data.fullName;
            console.log(managerId);
            console.log(managerName);
            continue;
          }
        }
      }
      console.log("Employee has been added.  Please view all employees to verify");
      connection.query(
        'INSERT INTO employee SET ?',
        {
          first_name: addName.first,
          last_name: addName.last,
          role_id: roleId,
          manager_id: parseInt(managerId)
        },
        (err, res) => {
          if (err) throw err;
          prompt();
        }
      );
    });
  });
};

function askName(){
  return([
    {
      name: 'first',
      type: 'input',
      message: "Please enter the first name:"
    },
    {
      name: 'last',
      type: 'input',
      message: "Please enter the last name:"
    }
  ]);
};

async function updateRole() {
  const employeeId = await inquirer.prompt(askId());

  connection.query('SELECT role.id, role.title FROM role ORDER BY role.id;', async (err, res) => {
    if (err) throw err;
    const {role} = await inquirer.prompt([
      {
          name: 'role',
          type: 'list',
          choices: () => res.map(res => res.title),
          message: "What is the new role for this employee?:"
      }
    ]);
    let roleId;
    for (const row of res) {
      if (row.title === role) {
        roleId = row.id;
        continue;
      }
    }
    connection.query(`UPDATE employee
    SET role_id = ${roleId}
    WHERE employee.id = ${employeeId.name}`, async (err, res) => {
      if (err) throw err;
      console.log("Role has been updated")
      prompt();
    });
  });
};

function askId() {
  return ([
    {
        name: 'name',
        type: 'input',
        message: "What is the employee id?:"
    }
  ]);
};

function showByManager() {
  const query = `SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, department.name AS department, employee.id, employee.first_name, employee.last_name
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id && employee.manager_id !='NULL')
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY manager;`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log ('/n');
    console.log('VIEW EMPLOYEE BY MANAGER');
    console.log('/n');
    console.table(res);
    prompt();
  });
};

function showByDepartment() {
  const query = `SELECT department.name AS department,
                        role.title, 
                        employee.id, 
                        employee.first_name, 
                        employee.last_name
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
};

async function removeEmployee() {
  const answer = await inquirer.prompt([
    {
        name: 'fisrt',
        type: 'input',
        message: "Please enter the empoyee id you want to remove: "
    }
  ]);
  connection.query('DELETE FROM employee WHERE ?',
  {
      id: answer.fisrt
  },
  function (err) {
    if (err) throw err;
  }
  )
  console.log('Employee has been removed on the system');
  prompt();;
}

async function exit() {
  connection.end(function(err) {
    if (err) {
      return console.log('error:' + err.message);
    }
    console.log('Close the database connection.');
  });
};

prompt();

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
