let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../../app');
const path = require('path')
var expect = chai.expect;
const fs = require('fs');
let correctFile = fs.readFileSync(path.join(__dirname, '../../test-files/Shubham Nagarro Resume.docx'));
let wrongFile = fs.readFileSync(path.join(__dirname, '../../test-files/shubham-soni-jaipur-profile-pic.jpg'));

describe("Resume update API", () => {
    let config = require('../config');
    context('Resume update:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("2. Authorization", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    console.log(response.body)
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Validation of type", (done) => {
            chai.request(server)
                .put("/employee/resume")
                .set({ "Authorization": `Bearer ${config.EmployeeToken}` })
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
        it("4. Update", (done) => {
            chai.request(server)
                .put("/employee/resume")
                //.field('a', "b")
                .set('Content-Type', 'multipart/form-data')
                .set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .attach('resume', correctFile, 'Shubham Nagarro Resume.docx').then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("5. Update Again", (done) => {
            chai.request(server)
                .put("/employee/resume")
                //.field('a', "b")
                .set('Content-Type', 'multipart/form-data')
                .set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .attach('resume', correctFile, 'Shubham Nagarro Resume.docx').then((response) => {
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