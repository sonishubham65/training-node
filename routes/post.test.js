let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../app');
var expect = chai.expect;
let ManagerToken;
let EmployeeToken;
describe("Post API", () => {
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
    context('--add a post', () => {
        it("--authentication", (done) => {
            chai.request(server)
                .post("/post/add").send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": [""],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli. The new BF CLI tool will replace legacy standalone tools to manage Bot Framework bots and related services. The old tools will be ported over in phases and all new features, bug fixes, and further investments will focus on the new BF CLI. Old tools will still work for the time being, but they are going to be deprecated in future releases.",
                    "status": "open"
                }).then((response) => {
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
                .post("/post/add").send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": ["PHP"],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli. The new BF CLI tool will replace legacy standalone tools to manage Bot Framework bots and related services. The old tools will be ported over in phases and all new features, bug fixes, and further investments will focus on the new BF CLI. Old tools will still work for the time being, but they are going to be deprecated in future releases.",
                    "status": "open"
                }).set({ "Authorization": `Bearer ${EmployeeToken}` }).then((response) => {
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
                .post("/post/add").set({ "Authorization": `Bearer ${ManagerToken}` }).send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": [""],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli. The new BF CLI tool will replace legacy standalone tools to manage Bot Framework bots and related services. The old tools will be ported over in phases and all new features, bug fixes, and further investments will focus on the new BF CLI. Old tools will still work for the time being, but they are going to be deprecated in future releases.",
                    "status": "open"
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
        it("Create a post", (done) => {
            chai.request(server)
                .post("/post/add").send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": ["PHP"],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli. The new BF CLI tool will replace legacy standalone tools to manage Bot Framework bots and related services. The old tools will be ported over in phases and all new features, bug fixes, and further investments will focus on the new BF CLI. Old tools will still work for the time being, but they are going to be deprecated in future releases.",
                    "status": "open"
                }).set({ "Authorization": `Bearer ${ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(201);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.data).to.be.an("object");
                    expect(response.body.data._id).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
    context('--List of post', () => {

        it("--authentication", (done) => {
            chai.request(server)
                .get("/post/page/1").then((response) => {
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
                .get("/post/page/1").set({ "Authorization": `Bearer ${EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("List all post, with Project Name", (done) => {
            chai.request(server)
                .get("/post/page/1?project_name=ging").set({ "Authorization": `Bearer ${ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('data');
                    expect(response.body.data).to.contain.all.keys("posts", "count");
                    expect(response.body.data.count).to.be.a("number");
                    if (response.body.data.posts.length > 0) {
                        for (let i = 0; i < response.body.data.posts.length; i++) {
                            let post = response.body.data.posts[i];
                            expect(post).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user_id", "description", "created_at");
                            expect(post.technologies).to.be.an("array");
                            expect(new Date(post.created_at)).to.be.an.a("date");
                        }
                    }
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("List all post, with ID", (done) => {
            chai.request(server)
                .get("/post/page/1?_id=5f28013d718afc8b10693eb8").set({ "Authorization": `Bearer ${ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('data');
                    expect(response.body.data).to.contain.all.keys("posts", "count");
                    expect(response.body.data.count).to.be.a("number");
                    if (response.body.data.posts.length == 1) {
                        let post = response.body.data.posts[0];
                        expect(post).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user_id", "description", "created_at");
                        expect(post.technologies).to.be.an("array");
                        expect(new Date(post.created_at)).to.be.an.a("date");
                    }
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("List all post, page count exceed limit", (done) => {
            chai.request(server)
                .get("/post/page/1000000").set({ "Authorization": `Bearer ${ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('data');
                    expect(response.body.data).to.contain.all.keys("posts", "count");
                    expect(response.body.data.count).to.be.a("number");
                    expect(response.body.data.posts).to.be.an("array");
                    expect(response.body.data.posts.length).to.be.equal(0);
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    });

    context('--Single Post', () => {
        it("--authentication", (done) => {
            chai.request(server)
                .get("/post/5f28013d718afc8b10693eb8").then((response) => {
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
                .get("/post/5f28013d718afc8b10693eb8").set({ "Authorization": `Bearer ${EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("get a post", (done) => {
            chai.request(server)
                .get("/post/5f28013d718afc8b10693eb8").set({ "Authorization": `Bearer ${ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.data).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user_id", "description", "created_at");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})