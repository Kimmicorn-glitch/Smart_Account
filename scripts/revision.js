const {ethers} = require("hardhat");

async function main(){
    const [deployer, beneficiary] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("Address: ", deployerAddress);

    const entryPointAddress = process.env.ENTRYPOINT_ADDRESS.toLowerCase();
    const entryPoint = await ethers.getContractAt("EntryPoint", entryPointAddress);

    const accountFactoryAddress = process.env.ACCOUNT_FACTORY_ADDRESS.toLowerCase();
    const accountFactory = await ethers.getContractAt("contracts/Account.sol:AccountFactory", accountFactoryAddress);

    const SmartAccount = await ethers.getContractFactory("contracts/Account.sol:Account");

    //initCode
    const tx = await accountFactory.createAccount(deployerAddress);
    await tx.wait();
    const factoryData = tx.data.slice(2);
    const initCode = accountFactoryAddress + factoryData;

    //sender
    let error;
    let sender;
    try{
        await entryPoint.getSenderAddress(initCode);

    }catch(error){
        sender = "0x" + error.data.data.slice(-40);
        console.log("Sender: ", sender);
        //console.log(Object.keys(error));  // see what properties exist
        //console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2)); // see the whole error because Node hides the full error and shows the message and stack
    }
    

    //calldata
    const callData = await SmartAccount.interface.encodeFunctionData("execute", []);

    //fund the entryPoint
    await entryPoint.depositTo(sender, { value: ethers.parseEther("0.1") });


    let userOp = {
        sender: sender,
        nonce: await entryPoint.getNonce(sender, 0),
        initCode: "0x",
        callData: callData,
        callGasLimit: 200000,
        verificationGasLimit: 150000,
        preVerificationGas: 50000,
        maxFeePerGas: 20000000000,
        maxPriorityFeePerGas: 20000000000,
        paymasterAndData: "0x",
        signature: "0x"
    };

    //sign userOp
    const userOpHash = await entryPoint.getUserOpHash(userOp);

    userOp.signature = await deployer.signMessage(ethers.getBytes(userOpHash));

    await entryPoint.handleOps([userOp], beneficiary);

    const smartAccount = await ethers.getContractAt("contracts/Account.sol:Account", sender);
    const count = await smartAccount.count();
    console.log("Count: ", count);

}
main().catch(console.error)