let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../../app');
var expect = chai.expect;
var uniqid = require('uniqid');
const fs = require('fs');
const path = require('path');
const config = require('../config');

let EmployeeEmail = uniqid() + "@nagarro.com";
let ManagerEmail = uniqid() + "@nagarro.com";

describe("Testing account API", () => {
    context('Signup:', () => {
        it("1. Validation", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr.@Employee",
                    "email": "employee@nagarro.com",
                    "password": "Pass@123",
                    "role": "employee"
                }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("2. Create an employee", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Employee",
                    "email": EmployeeEmail,
                    "password": "Pass@123",
                    "role": "employee"
                }).then((response) => {
                    expect(response.statusCode).to.equal(201);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Create a manager", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Manager",
                    "email": ManagerEmail,
                    "password": "Pass@123",
                    "role": "manager"
                }).then((response) => {
                    expect(response.statusCode).to.equal(201);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("4. Duplicate Employee", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Employee",
                    "email": EmployeeEmail,
                    "password": "Pass@123",
                    "role": "employee"
                }).then((response) => {
                    expect(response.statusCode).to.equal(409);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("5. Duplicate Manager", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Manager",
                    "email": ManagerEmail,
                    "password": "Pass@123",
                    "role": "manager"
                }).then((response) => {
                    expect(response.statusCode).to.equal(409);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
    context('Login:', () => {
        it("1. Validation", (done) => {
            chai.request(server)
                .post("/user/login").send({
                    "email": "employee@nagarro.com",
                    "password": "Pass123",
                }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("2. Email is not registered with us", (done) => {
            chai.request(server)
                .post("/user/login").send({
                    "email": "xxxxxx@nagarro.com",
                    "password": "Pass@123",
                }).then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Login as an employee", (done) => {
            chai.request(server)
                .post("/user/login").send({
                    "email": EmployeeEmail,
                    "password": "Pass@123",
                }).then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.contain.all.keys('token');
                    expect(response.body.token).to.be.a('string');
                    config.EmployeeToken = response.body.token;
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("4. Login as a manager", (done) => {
            chai.request(server)
                .post("/user/login").send({
                    "email": ManagerEmail,
                    "password": "Pass@123",
                }).then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.contain.all.keys('token');
                    expect(response.body.token).to.be.a('string');
                    config.ManagerToken = response.body.token;

                    /**
                     * update configs
                     */
                    fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config));
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("5. Profile of Employee", (done) => {
            chai.request(server)
                .get("/user/profile")
                .set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.contain.all.keys('data');
                    expect(response.body.data).to.be.an('object');
                    expect(response.body.data).to.contain.all.keys('role', 'status', '_id', 'name', 'email', 'login_at');
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("6. Profile of Manager", (done) => {
            chai.request(server)
                .get("/user/profile")
                .set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.contain.all.keys('data');
                    expect(response.body.data).to.be.an('object');
                    expect(response.body.data).to.contain.all.keys('role', 'status', '_id', 'name', 'email', 'login_at');
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})