let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../../app');
const path = require('path')
var expect = chai.expect;
const fs = require('fs');
let EmployeeToken;
let ManagerToken;
describe("Resume API", () => {
    before((done) => {
        chai.request(server)
            .post("/user/login").send({
                "email": "manager@nagarro.com",
                "password": "Pass@123",
            }).then((response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.contain.all.keys('data', 'token');
                expect(response.body.data).to.contain.all.keys('role', '_id', 'name', 'email', 'created_at', 'login_at');
                expect(response.body.data.role).to.equal('manager');

                ManagerToken = response.body.token;
                done();
            }).catch(err => {
                console.log(err);
            })

    })
    before((done) => {
        chai.request(server)
            .post("/user/login").send({
                "email": "employee@nagarro.com",
                "password": "Pass@123",
            }).then((response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.contain.all.keys('data', 'token');
                expect(response.body.data).to.contain.all.keys('role', '_id', 'name', 'email', 'created_at', 'login_at');
                expect(response.body.data.role).to.equal('employee');

                EmployeeToken = response.body.token;
                done();
            }).catch(err => {
                console.log(err);
            })
    })
    let correctFile = fs.readFileSync(path.join(__dirname, '../../test-files/Shubham Nagarro Resume.docx'));
    let wrongFile = fs.readFileSync(path.join(__dirname, '../../test-files/shubham-soni-jaipur-profile-pic.jpg'));
    context('--Resume update', () => {
        it("--authentication", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .attach('resume', correctFile, 'Shubham Nagarro Resume.docx').then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("--authorization", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .set({ "Authorization": `Bearer ${ManagerToken}` })
                .attach('resume', correctFile, 'Shubham Nagarro Resume.docx').then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("--validation", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .set({ "Authorization": `Bearer ${EmployeeToken}` })
                .attach('resume', wrongFile, 'shubham-soni-jaipur-profile-pic.jpg')
                .type('form').then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("--update", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .field('a', "b")
                .set('Content-Type', 'multipart/form-data')
                .set({ "Authorization": `Bearer ${EmployeeToken}` })
                .attach('resume', correctFile, 'Shubham Nagarro Resume.docx').then((response) => {
                    console.log(response.body)
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})