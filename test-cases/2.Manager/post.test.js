let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../../app');
var expect = chai.expect;

const fs = require('fs');
const path = require('path');

describe("Manager, Post Crud operations API", () => {
    const config = require('../config');

    context('Post Add:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .post("/manager/post").send({}).then((response) => {
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
                .post("/manager/post/").send({}).set({ "Authorization": `Bearer ${config.EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("3. Validation", (done) => {
            chai.request(server)
                .post("/manager/post").set({ "Authorization": `Bearer ${config.ManagerToken}` }).send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": [""],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
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
        it("4. Add", (done) => {
            chai.request(server)
                .post("/manager/post").send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": ["PHP"],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
                    "status": "open"
                }).set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(201);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    expect(response.body.data).to.be.an("object");
                    expect(response.body.data._id).to.be.a("string");
                    config.postId = response.body.data._id;
                    /**
                     * update configs
                     */
                    fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config));
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("5. Add second post for delete", (done) => {
            chai.request(server)
                .post("/manager/post").send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": ["PHP"],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
                    "status": "open"
                }).set({ "Authorization": `Bearer ${config.ManagerToken}` })
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
    })


    context('Post List:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get("/manager/post/page/1").then((response) => {
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
                .get("/manager/post/page/1").set({ "Authorization": `Bearer ${config.EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })

        it("3. Post List, with Project Name", (done) => {
            chai.request(server)
                .get("/manager/post/page/1?project_name=ging").set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('data');
                    expect(response.body.data).to.contain.all.keys("posts", "total");
                    expect(response.body.data.total).to.be.a("number");
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

        it("Post List, with ID", (done) => {
            chai.request(server)
                .get("/manager/post/page/1?_id=5f28013d718afc8b10693eb8").set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('data');
                    expect(response.body.data).to.contain.all.keys("posts", "total");
                    expect(response.body.data.total).to.be.a("number");
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

        it("Post List, with page count exceed limit", (done) => {
            chai.request(server)
                .get("/manager/post/page/1000000").set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('object').that.has.property('data');
                    expect(response.body.data).to.contain.all.keys("posts", "total");
                    expect(response.body.data.total).to.be.a("number");
                    expect(response.body.data.posts).to.be.an("array");
                    expect(response.body.data.posts.length).to.be.equal(0);
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    });
    /**
     * @description: All the test case when getting a post
     */
    context('Post Get:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .get(`/manager/post/${config.postId}`).then((response) => {
                    expect(response.statusCode).to.equal(401);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("2. authorization", (done) => {
            chai.request(server)
                .get(`/manager/post/${config.postId}`).set({ "Authorization": `Bearer ${config.EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("3. Post get", (done) => {
            chai.request(server)
                .get(`/manager/post/${config.postId}`).set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.data).to.contain.all.keys("technologies", "role", "status", "_id", "project_name", "client_name", "user_id", "description", "created_at");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
    /**
     * @description: All the test case when updating a post
     */
    context('Post update:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .patch(`/manager/post/${config.postId}`).send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": [""],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
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
        it("2. Authorization", (done) => {
            chai.request(server)
                .patch(`/manager/post/${config.postId}`).send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": ["PHP"],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
                    "status": "open"
                }).set({ "Authorization": `Bearer ${config.EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("3. Validation", (done) => {
            chai.request(server)
                .patch(`/manager/post/${config.postId}`).set({ "Authorization": `Bearer ${config.ManagerToken}` }).send({
                    "project_name": "Ginger",
                    "client_name": "Nagarro",
                    "technologies": [""],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
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
        it("4. Post update", (done) => {
            chai.request(server)
                .patch(`/manager/post/${config.postId}`).send({
                    "project_name": "Ginger",
                    "client_name": "Nagarrxo",
                    "technologies": ["PHP"],
                    "role": "trainee",
                    "description": "The Bot Framework SDK team is happy to announce the General Availability of the consolidated bot framework CLI tool bf-cli.",
                    "status": "open"
                }).set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(202);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
    /**
     * @description: All the test case when deleting a post
     */
    context('Post delete:', () => {
        it("1. Authentication", (done) => {
            chai.request(server)
                .delete(`/manager/post/${postId}`).then((response) => {
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
                .delete(`/manager/post/${postId}`).set({ "Authorization": `Bearer ${config.EmployeeToken}` }).then((response) => {
                    expect(response.statusCode).to.equal(403);
                    expect(response.body).to.be.an('object').that.has.property('message');
                    expect(response.body.message).to.be.a("string");
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("3. Post Delete", (done) => {
            chai.request(server)
                .delete(`/manager/post/${postId}`).set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(200);
                    done();
                }).catch(err => {
                    done(err)
                })
        })
        it("4. Post delete again", (done) => {
            chai.request(server)
                .delete(`/manager/post/${postId}`).set({ "Authorization": `Bearer ${config.ManagerToken}` })
                .then((response) => {
                    expect(response.statusCode).to.equal(204);
                    done();
                }).catch(err => {
                    done(err)
                })
        })
    })
})