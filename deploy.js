const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
 'sock need minimum blue swamp replace can shrimp flower alley velvet cream',
 'https://rinkeby.infura.io/v3/621f412220fc4f6dbc00e6f5e5619391'
  );

const web3 = new Web3(provider);

// const result = await new web3.eth.Contract(JSON.parse(interface))
//      .deploy({data: '0x' + bytecode, arguments: ['Hi there!']}) // add 0x bytecode
//      .send({from: accounts[0]}); // remove 'gas'


const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: '0x' + bytecode})
    .send({from: accounts[0]});

  console.log("Result object:  ", result)
  console.log('Contract deployed to', result.options.address);


};

deploy();
