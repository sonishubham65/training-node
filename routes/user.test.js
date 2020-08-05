let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../app');
var expect = chai.expect;
var uniqid = require('uniqid');
describe("User API", () => {
    context('--signup', () => {
        it("--validation", (done) => {
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

        it("--duplicate resource", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Employee",
                    "email": "employee@nagarro.com",
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

        it("Create an employee", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Employee",
                    "email": uniqid() + "@nagarrox.com",
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

        it("Create a manager", (done) => {
            chai.request(server)
                .post("/user/signup").send({
                    "name": "Jr. Manager",
                    "email": uniqid() + "@nagarro.com",
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

    })


    context('--Login', () => {
        it("--validation", (done) => {
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

        it("--no email with us", (done) => {
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

        it("login a user as an employee", (done) => {
            chai.request(server)
                .post("/user/login").send({
                    "email": "employee@nagarro.com",
                    "password": "Pass@123",
                }).then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.contain.all.keys('data', 'token');
                    expect(response.body.data).to.contain.all.keys('role', '_id', 'name', 'email', 'created_at', 'login_at');
                    expect(response.body.data.role).to.equal('employee');
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("login a user as a manager", (done) => {
            chai.request(server)
                .post("/user/login").send({
                    "email": "manager@nagarro.com",
                    "password": "Pass@123",
                }).then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.contain.all.keys('data', 'token');
                    expect(response.body.data).to.contain.all.keys('role', '_id', 'name', 'email', 'created_at', 'login_at');
                    expect(response.body.data.role).to.equal('manager');
                    done();
                }).catch(err => {
                    done(err)
                })
        })

    })
})