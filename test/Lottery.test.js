const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode })
    .send( {from: accounts[0], gas:'1000000'});
});

describe('Lottery Contract', () => {
  it('deploys contract', () => {
    assert.ok(lottery.options.address);
  });

  it('allows one account to enter', async() =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.2', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter', async() =>{
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.2', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.21', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.22', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('throws an error when sending too little ether', async() =>{
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 10
      });
      assert(false);
    } catch (err) {
      assert(err);
    }

  });


  it('only manager can call pickWinner', async() => {
    try {
      await lottery.methods.pickWinner().send( {
        from: accounts[1]
      });
      assert(false);
    }
    catch(err) {
      assert(err);
    }
  });

 it("picks the correct winner and puts ether in winner's account", async() => {
   await lottery.methods.enter().send({
     from: accounts[1],
     value: web3.utils.toWei('2', 'ether')
   });
   const initialBalance = await web3.eth.getBalance(accounts[1]);
   await lottery.methods.pickWinner().send({
     from: accounts[0]
   });
   const finalBalance = await web3.eth.getBalance(accounts[1]);
   const difference = finalBalance - initialBalance;

   assert(difference > web3.utils.toWei('1.9', 'ether'));

   const players = await lottery.methods.getPlayers().call({from: accounts[0]});
   assert.equal(0, players.length);
   const lotteryBalance = await web3.eth.getBalance(lottery.options.address);
   assert.equal(0, lotteryBalance);
 });

});
