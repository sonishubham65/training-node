let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
const uniqid = require('uniqid')
let server = require('../../app');
var expect = chai.expect;

describe("Employee Position API", () => {
    let config = require('../config');

    /**
     * @description: All the test case for listing the position
     */
    context('Positions List:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get("/position/page/1").then((response) => {
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
                .get("/position/page/0").set({ "Authorization": `Bearer ${config.EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Positions List", (done) => {
            chai.request(server)
                .get("/position/page/1").set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.contain.all.keys("posts", "total");
                    expect(response.body.data.posts).to.be.an("array");
                    if (response.body.data.posts.length > 0) {
                        response.body.data.posts.forEach(post => {
                            expect(post).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "description", "created_at");
                            expect(post.technologies).to.be.an('array');
                        })
                    }
                    expect(response.body.data.total).to.be.a("number");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })

    context('Single Position:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get(`/position/${config.postId}`).then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("2. Position Get", (done) => {
            chai.request(server)
                .get(`/position/${config.postId}`).set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.be.an("object");
                    expect(response.body.data).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user", "description", "created_at");
                    expect(response.body.data.technologies).to.be.an('array');
                    expect(response.body.data.user).to.be.an('object');
                    if (response.body.data.application) {
                        expect(response.body.data.application).to.be.an('object');
                        expect(response.body.data.user).to.contain.all.keys("_id", 'email', "name");
                        expect(response.body.data.application).to.contain.all.keys("_id", "created_at", "status");
                    }

                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })

    context('Position Apply:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .post(`/position/apply/${config.postId}`).then((response) => {
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
                .post(`/position/apply/${config.postId}`).set({ "Authorization": `Bearer ${config.ManagerToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("3. Positions Apply", (done) => {
            chai.request(server)
                .post(`/position/apply/${config.postId}`).set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(201);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("4. Position Get After Apply", (done) => {
            chai.request(server)
                .get(`/position/${config.postId}`).set({ "Authorization": `Bearer ${config.EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.be.an("object");
                    expect(response.body.data).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user", "description", "created_at");
                    expect(response.body.data.technologies).to.be.an('array');
                    expect(response.body.data.user).to.be.an('object');
                    expect(response.body.data.application).to.be.an('object');
                    expect(response.body.data.user).to.contain.all.keys("_id", 'email', "name");
                    expect(response.body.data.application).to.contain.all.keys("_id", "created_at", "status");

                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})