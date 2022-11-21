DROP DATABASE IF EXISTS employees;
CREATE DATABASE employees;

USE employees;

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT
);

CREATE TABLE department (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT NOT NULL,
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE
);

INSERT INTO department
  (name)
VALUES 
  ('Sales'),
  ('Engineering'),
  ('Finance'),
  ('Legal');
INSERT INTO role
  (title, salary, department_id)
VALUES
  ('Sales Lead', 100000, 1),
  ('Salesperson', 80000, 1),
  ('Lead Engineer', 150000, 2),
  ('Software Engineer', 120000, 2),
  ('Account Manager', 160000, 3),
  ('Accountant', 125000, 3),
  ('Legal Team Lead', 250000, 4),
  ('Lawyer', 190000, 4);
INSERT INTO employee
  (first_name, last_name, role_id, manager_id)
VALUES
  ('Virginia', 'Vermillion', 1, NULL),
  ('Ronald', 'Kelly', 1, NULL),
  ('Stacy', 'Wilke', 2, NULL),
  ('Edgar', 'Rogers', 2, NULL),
  ('Andrew', 'Monroe', 3, NULL),
  ('Frank', 'Townsend', 3, NULL),
  ('Jill', 'Polk', 4, NULL),
  ('Ruth', 'Willimas', 4, NULL);