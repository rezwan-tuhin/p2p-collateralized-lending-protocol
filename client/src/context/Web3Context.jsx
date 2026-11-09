import { createContext, useContext, useState, useEffect } from "react";
import {ethers} from "ethers";

const Web3Context = createContext();

export const Web3Provider = ({children}) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    const init = async () => {
        if(typeof window != "undefined" && window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            const accounts = await browserProvider.send("eth_accounts", []);
            if(accounts.length > 0) {
                const userSigner = await browserProvider.getSigner();
                setAccount[0];
                setSigner(userSigner);
            }

            window.ethereum.on("accountChanged", (newAccounts) => {
                if(newAccounts.length > 0) {
                    setAccount(newAccounts[0]);
                    window.location.reload();
                }else{
                    disconnectWallet();
                }
            } );

            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
        }
    };
    useEffect(() => {
        init();
    }, []);

    const connectWallet = async () => {
        if(!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }
        try{
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            await browserProvider.send("eth_requestAccounts", []);
            const userSigner = await browserProvider.getSigner();
            const userAddress = await userSigner.getAddress();

            setProvider(browserProvider);
            setSigner(userSigner);
            setAccount(userAddress);
        }catch(error) {
            console.error("Connection failed", error);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
    };

    return(
        <Web3Context.Provider value={{account, provider, signer, connectWallet, disconnectWallet}} >
            {children}
        </Web3Context.Provider>
    );
}

export const useWeb3 = () => useContext(Web3Context);