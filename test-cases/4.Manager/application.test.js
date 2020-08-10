let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../../app');
var expect = chai.expect;
const fs = require('fs');
const path = require('path');
describe("Manager Application API", () => {
    let config = require('../config.json');

    /**
     * @description: All the test case for listing the applications
     */
    context('Applied Applications List:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get(`/manager/post/${config.postId}/application/page/1`).then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("2. Validation", (done) => {
            chai.request(server)
                .get(`/manager/post/${config.postId}/application/page/0`)
                .set({ "Authorization": `Bearer ${config.ManagerToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Application List", (done) => {
            chai.request(server)
                .get(`/manager/post/${config.postId}/application/page/1`)
                .set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.contain.all.keys("post", "applications", "totalPages");
                    expect(response.body.data.post).to.be.an("object");
                    expect(response.body.data.post).to.contain.all.keys('project_name', 'client_name', 'created_at', 'status', 'role');
                    expect(response.body.data.applications).to.be.an("array");
                    if (response.body.data.applications.length > 0) {
                        response.body.data.applications.forEach(application => {
                            config.application_id = application._id;
                            expect(application).to.contain.all.keys("_id", "user_id", "created_at");
                            expect(application.user_id).to.be.an("object");
                            expect(application.user_id).to.contain.all.keys("name", "email");
                        })
                    }
                    expect(response.body.data.totalPages).to.be.a("number");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })

    /**
     * @description: All the test case for getting application
     */
    context('Application details:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get(`/manager/post/application/${config.application_id}`).then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("2. Validation", (done) => {
            chai.request(server)
                .get(`/manager/post/application/`)
                .set({ "Authorization": `Bearer ${config.ManagerToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Application details", (done) => {
            chai.request(server)
                .get(`/manager/post/application/details/${config.application_id}`)
                .set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.contain.all.keys("_id", "created_at", "user", "post");
                    expect(response.body.data.post).to.be.an("object");
                    expect(response.body.data.user).to.be.an("object");
                    expect(response.body.data.post).to.contain.all.keys('_id', 'technologies', 'project_name', 'client_name', 'created_at', 'description', 'status', 'role');
                    expect(response.body.data.post.technologies).to.be.an("array");

                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })

    /**
     * @description: All the test case for download resume for an application
     */
    context('Application details:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get(`/manager/post/application/resume/${config.application_id}`).then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("2. Validation", (done) => {
            chai.request(server)
                .get(`/manager/post/application/resume/x`)
                .set({ "Authorization": `Bearer ${config.ManagerToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Application Resume download", (done) => {
            chai.request(server)
                .get(`/manager/post/application/resume/${config.application_id}`)
                .set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    let result = response.text;
                    var testResume = fs.readFileSync(path.join(__dirname, '../../test-files/Shubham Nagarro Resume.docx'));
                    expect(testResume.toString()).to.equal(result.toString());
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})