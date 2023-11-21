require("dotenv").config();
const { employeeService, idCreator } = require("../services");
const fs = require("fs");
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');


exports.getAllEmployees = async (req,res) => {
    const employees = await employeeService.getAllEmployees();
    res.send(employees); 
}

exports.getEmployeeById = async (req,res) => {
    const id = parseInt(req.params.id);
    const employee = await employeeService.getEmployeeById(id);
    if(employee) {
        res.send(employee);
    }else {
        res.status(404).send("Çalışan Bulunamadı!!")
    }
}

exports.createEmployee = async (req,res) => {
    try{
        const dbDataString = fs.readFileSync(dbPath, "utf-8");
        const dbData = JSON.parse(dbDataString);
        const data = req.body;
        const newId = await idCreator.generateUniqueId();   
        const {name, age, stillEmployee} = data;
        const employee = await employeeService.createEmployee(newId, name, age, stillEmployee);
        if(employee){
            dbData.push(employee)
            const dbDataStr = JSON.stringify(dbData, null, 2);
            fs.writeFileSync(dbPath,dbDataStr);
            res.status(201).send("Employee created!");

        }  
    } catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }


}

exports.updateEmployee = async (req,res) => {
    try{
        const dbDataString = fs.readFileSync(dbPath, "utf-8");
        const dbData = JSON.parse(dbDataString);
        const paramId = parseInt(req.params.id);
        const data = req.body;
        const employeeIndex = await employeeService.getEmployeeIndexById(paramId);
        console.log(employeeIndex);
        if(employeeIndex > -1) {
            const {name, age, stillEmployee} = data;
            const employeeToUpdate = employeeService.createEmployee(paramId, name, age, stillEmployee);
            dbData[employeeIndex] = employeeToUpdate;
            const dbDataStr = JSON.stringify(dbData, null, 2);
            fs.writeFileSync(dbPath,dbDataStr);
            res.status(202).send("Çalışan Güncellendi!");
        }else {
            res.status(404).send("Çalışan Bulunamadı!!")
        }
    } catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }

    
}


exports.deleteEmployee = async (req, res) => {
    const dbDataString = fs.readFileSync(dbPath, "utf-8");
    const dbData = JSON.parse(dbDataString);
    const id = parseInt(req.params.id);
    const employeeIndex = await employeeService.getEmployeeIndexById(id);
    if(employeeIndex > -1){
        dbData.splice(employeeIndex, 1);
        const dbDataStr = JSON.stringify(dbData, null, 2);
        fs.writeFileSync(dbPath,dbDataStr);
        res.status(200).send("Employee Deleted!");
    }else {
        res.status(404).send("Çalışan Bulunamadı!!");
    }
}
