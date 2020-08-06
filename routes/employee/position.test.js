let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
const uniqid = require('uniqid')
let server = require('../../app');
var expect = chai.expect;
let uniqueEmail = uniqid() + "@nagarro.com";
let ManagerToken;
let EmployeeToken;
let postId;
describe("********************Position API********************", () => {
    before((done) => {
        chai.request(server)
            .post("/user/signup").send({
                "name": "Jr. Employee",
                "email": uniqueEmail,
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
                "email": uniqueEmail,
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

    before((done) => {
        chai.request(server)
            .post("/manager/post").send({
                "project_name": "Ginger",
                "client_name": "Nagarro",
                "technologies": ["PHP"],
                "role": "trainee",
                "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
                "status": "open"
            }).set({ "Authorization": `Bearer ${ManagerToken}` })
            .then((response) => {
                expect(response.statusCode).to.equal(201);
                expect(response.body).to.be.an('object').that.has.property('message');
                expect(response.body.message).to.be.a("string");
                expect(response.body.data).to.be.an("object");
                expect(response.body.data._id).to.be.a("string");

                postId = response.body.data._id;
                done();
            }).catch(err => {
                done(err)
            })
    })
    /**
     * @description: All the test case for listing the position
     */
    context('--list position', () => {
        it("--authentication", (done) => {
            chai.request(server)
                .get("/employee/position/page/1").then((response) => {
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
                .get("/employee/position/page/1").set({ "Authorization": `Bearer ${ManagerToken}` }).then((response) => {
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
                .get("/employee/position/page/0").set({ "Authorization": `Bearer ${EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(422);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.errorStack).to.be.an("array");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("get List of Positions", (done) => {
            chai.request(server)
                .get("/employee/position/page/1").set({ "Authorization": `Bearer ${EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.contain.all.keys("posts", "totalPages");
                    expect(response.body.data.posts).to.be.an("array");
                    if (response.body.data.posts.length > 0) {
                        response.body.data.posts.forEach(post => {
                            expect(post).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user_id", "description", "created_at");
                            expect(post.technologies).to.be.an('array');
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
     * @description: All the test case for getting single position
     */
    context('--single position', () => {
        it("--authentication", (done) => {
            chai.request(server)
                .get(`/employee/position/${postId}`).then((response) => {
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
                .get(`/employee/position/${postId}`).set({ "Authorization": `Bearer ${ManagerToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("get single Positions", (done) => {
            chai.request(server)
                .get(`/employee/position/${postId}`).set({ "Authorization": `Bearer ${EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).that.has.property("data");
                    expect(response.body.data).to.be.an("object");
                    expect(response.body.data).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user_id", "description", "created_at");
                    expect(response.body.data.technologies).to.be.an('array');
                    expect(response.body.data.user_id).to.be.an('object');
                    expect(response.body.data.user_id).to.contain.all.keys("name", 'email');
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
    /**
     * @description: Apply for the position
     */
    context('--Apply position', () => {
        it("--authentication", (done) => {
            chai.request(server)
                .post(`/employee/position/apply/${postId}`).then((response) => {
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
                .post(`/employee/position/apply/${postId}`).set({ "Authorization": `Bearer ${ManagerToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("apply Positions", (done) => {
            chai.request(server)
                .post(`/employee/position/apply/${postId}`).set({ "Authorization": `Bearer ${EmployeeToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(201);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})