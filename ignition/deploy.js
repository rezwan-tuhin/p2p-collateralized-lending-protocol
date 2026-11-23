const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
async function main() {
    console.log("deployment starts...");

    const TestNFT = await hre.ethers.getContractFactory('TestNFT');
    const LendingProtocol = await hre.ethers.getContractFactory('P2PLendingProtocol');

    const testNft = await TestNFT.deploy();
    await testNft.waitForDeployment();

    const testNftAddress = await testNft.getAddress();

    console.log("Test NFT deployed to: ", testNftAddress);


    const lendingProtocol = await LendingProtocol.deploy();
    await lendingProtocol.waitForDeployment();

    const lendingProtocolAddress = await lendingProtocol.getAddress();
    console.log('Lending Protocol deployed to: ', lendingProtocolAddress);

    saveConstants(testNftAddress, lendingProtocolAddress);

}

function saveConstants(testNftAddress, lendingProtocolAddress) {


    const constDir = path.join(__dirname, "..", "client", "src", "constants");

    if(!fs.existsSync(constDir)) {
        fs.mkdirSync(constDir, {recursive: true});
    }

    const testNftAbi = hre.artifacts.readArtifactSync('TestNFT').abi;
    const lendingProtocolAbi = hre.artifacts.readArtifactSync('P2PLendingProtocol').abi;

    const contractData = `
    
    export const TEST_NFT_ADDRESS = "${testNftAddress}";
    export const LENDING_PROTOCOL_ADDRESS = "${lendingProtocolAddress}";

    export const TEST_NFT_ABI = ${JSON.stringify(testNftAbi, null, 2)};
    export const LENDING_PROTOCOL_ABI = ${JSON.stringify(lendingProtocolAbi, null, 2)};

    `

    fs.writeFileSync(
        path.join(constDir, "constant.js"), contractData
    )

    console.log("contract data automatically updated in frontend")
}

main().catch((err) => {
    console.error(err);
})