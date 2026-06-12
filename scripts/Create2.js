const {ethers} = require("hardhat");

async function main(){
    //get signers
    const [user1, user2] = await ethers.getSigners();
    const user1Address = await user1.getAddress();
    console.log("User1 address: ", user1Address);

    //deploy AccountFactory
    const accountFactoryAddress = process.env.ACCOUNT_FACTORY_ADDRESS.toLowerCase();
    const accountFactory = await ethers.getContractAt("contracts/Account.sol:AccountFactory", accountFactoryAddress);

    //call createAccount
    //it returns the whole transaction
    const account = await accountFactory.createAccount(user1Address);
    await account.wait();

    const calldata = account.data.slice(2);//remove "0x"
    console.log("CallData: ", calldata);

    //add factory address with callData to get  initCode
    const initCode = accountFactoryAddress + calldata;
    console.log("InitCode: ", initCode);

    //deploy EntryPoint
    const entryPointAddress = process.env.ENTRYPOINT_ADDRESS.toLowerCase();
    const entryPoint = await ethers.getContractAt("EntryPoint", entryPointAddress);

    //use try catch of EntryPoint to get sender address
    let error;
    try{
        await entryPoint.getSenderAddress(initCode);
    } catch(error){
        const sender = "0x" + error.data.data.slice(-40);
        console.log("Sender: ", sender);
    }

    //use to get the return value of the function
    const sameSender = await accountFactory.createAccount.staticCall(user1Address);
    console.log("Same sender: ", sameSender);

}
main().catch(console.error)