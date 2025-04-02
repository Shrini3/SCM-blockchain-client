import { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import Web3 from "web3";
//import SupplyChainABI from "./artifacts/SupplyChain.json"
import { contract_address, abi } from './contractConfig';

export default function CallFunction() {
    const location = useLocation()
    const queryparams = new URLSearchParams(location.search)
    const history = useHistory()

    const [currentaccount, setCurrentaccount] = useState("");
    const [processed, setProcessed] = useState(false)
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [MED, setMED] = useState({});
    const [MedStage, setMedStage] = useState([]);
    const [ID, setID] = useState("");

    useEffect(() => {
        setID(queryparams.get('id'))
        loadWeb3();
        LoadBlockchaindata();
        // setTimeout(() => {
        //     checkStage()
        // }, 2000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ID]);

    useEffect(() => {
        checkStage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [MED, MedStage])


    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                "Non-Ethereum browser detected. You should consider trying MetaMask!"
            );
        }
    };

    const LoadBlockchaindata = async () => {
        setloader(true)
        console.log(queryparams.get('id'))
        console.log(ID)
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentaccount(account);
        //const networkId = await web3.eth.net.getId();
        //const networkData = SupplyChainABI.networks[networkId];
        if (/*networkData*/contract_address) {
            //const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            const supplychain = new web3.eth.Contract(abi, contract_address);
            setSupplyChain(supplychain);
            //const medCtr = await supplychain.methods.medicineCtr().call();
            //console.log(medCtr) -> displays count of medicine
            const med = {};
            const medStage = [];
            //for (let i = 1; i <= medCtr; i++) {
            if(ID) {
                med[ID] = await supplychain.methods.MedicineStock(ID).call();
                medStage[ID] = await supplychain.methods.showStage(ID).call();
            }
            //}
            setMED(med);
            setMedStage(medStage);
            setloader(false)
            console.log(MED)
            console.log(MedStage)
            checkStage()
        } else {
            window.alert('The smart contract is not deployed to the current network');
        }
    };

    async function checkStage() {
        try {
            console.log("executing...")
            if(MedStage[ID] === "Raw Material Supply Stage") {
                console.log("gggg")
                const reciept = await SupplyChain.methods.transportgoods(ID).send({ from: currentaccount });
                console.log(reciept)
                setProcessed(true)
            } else if(MedStage[ID] === "Raw Materials shipped - In Transit") {
                console.log(MedStage[ID])
                console.log('jjj')
                const receipt = await SupplyChain.methods.Manufacturing(ID).send({ from: currentaccount});
                console.log(receipt)
                setProcessed(true)
            } else if(MedStage[ID] === "Manufacturing Stage" && MED[ID].RMSid === "0") {
                console.log("qqq")
                await SupplyChain.methods.transportgoods(ID).send({from : currentaccount})
                setProcessed(true)
            } else if(MedStage[ID] === "Product shipped from Manufacturer - In Transit") {
                console.log("www")
                await SupplyChain.methods.Distribute(ID).send({from: currentaccount})
                setProcessed(true)
            } else if(MedStage[ID] === "Distribution Stage" && MED[ID].MANid === "0") {
                console.log("ttt")
                await SupplyChain.methods.transportgoods(ID).send({from: currentaccount})
                setProcessed(true)
            } else if(MedStage[ID] === "Medicines shipped from distributor - In Transit") {
                await SupplyChain.methods.Retail(ID).send({from: currentaccount})
                setProcessed(true)
            } else {
                //alert("an error occured!")
                console.log("no match")
            }
        } catch(err) {
            console.log(err)
        }
    }

    if(loader) {
        return (
            <h2>Loading...</h2>
        )
    }

    if(processed) {
        return (
            <>
                <div>
                    <span onClick={() => history.push('/')} className="btn btn-outline-danger btn-sm home-button">HOME</span>
                    <h3>Successfully Updated!</h3>
                </div>
            </>
        )
    }

    return (
        <h1>Processing...</h1>
    )
}