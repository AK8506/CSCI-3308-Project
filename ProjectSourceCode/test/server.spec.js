// ********************** Initialize server **********************************

const {app, db}  = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');


chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;


describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(app)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// Example Positive Testcase :
// API: /add_user
// Input: {id: 5, name: 'John Doe', dob: '2020-02-20'}
// Expect: res.status == 200 and res.body.message == 'Success'
// Result: This test case should pass and return a status 200 along with a "Success" message.
// Explanation: The testcase will call the /add_user API with the following input
// and expects the API to return a status of 200 along with the "Success" message.

describe('Testing Add User API', () => {
    it('positive : /register', done => {
      chai
        .request(app)
        .post('/register')
        .send({username: 'test3', email: 'test@email.com', password: 'test3'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
});


//We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 400 along with a "Invalid input" message.

describe('Testing Add User API', () => {
  
    it('Negative : /register. Checking invalid name', done => {
      chai
        .request(app)
        .post('/register')
        .send({username: null, email: 'test@email.com', password: 'test'})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });


  describe('Testing Redirect', () => {
    // Sample test case given to test /test endpoint.
    it('\test route should redirect to /login with 200 HTTP status code', done => {
      chai
        .request(app)
        .get('/test')
        .end((err, res) => {
          res.should.have.status(200); // Expecting a redirect status code
          res.should.redirectTo(/^.*127\.0\.0\.1.*\/login$/); // Expecting a redirect to /login with the mentioned Regex
          done();
        });
    });
  });


  describe('Profile Route Tests', () => {
    let agent;
    const testUser = {
      username: 'testuser',
      password: 'testpass123',
      email: 'testemail@test.com'
    };
  
    before(async () => {
      
      // Clear users table and create test user
      await db.query('TRUNCATE TABLE users CASCADE');
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await db.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [
        testUser.username,
        testUser.email,
        hashedPassword,
      ]);
    });
  
    beforeEach(() => {
      // Create new agent for session handling
      agent = chai.request.agent(app);
    });
  
    afterEach(() => {
      // Clear cookie after each test
      agent.close();
    });
  
    after(async () => {
      // Clean up database
      await db.query('TRUNCATE TABLE users CASCADE');
    });
  
    describe('GET /profile', () => {
      it('should return 401 if user is not authenticated', done => {
        chai
          .request(app)
          .get('/profile')
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.text).to.equal('Not authenticated');
            done();
          });
      });
  
      it('should return user profile when authenticated', async () => {
        // First login to get session
        await agent.post('/login').send(testUser);
  
        // Then access profile
        const res = await agent.get('/profile');
  
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('username', testUser.username);
      });
    });
  });
// ********************************************************************************