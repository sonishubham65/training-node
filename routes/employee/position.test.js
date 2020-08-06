let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../../app');
var expect = chai.expect;
let ManagerToken;
let EmployeeToken;
describe("********************Position API********************", () => {
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
    /**
     * @description: All the test case when creating a new post
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
})