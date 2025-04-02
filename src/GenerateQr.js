import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json";
import { useHistory } from "react-router-dom";
import {QRCodeCanvas} from "qrcode.react"
//import qrcode from 'qrcode';

export default function GenerateQR() {

    const history = useHistory()

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [ID, setID] = useState();
    const [MED, setMED] = useState();
    const [MedStage, setMedStage] = useState();
    const [showdata, setshowdata] = useState(false);

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
    const loadBlockchaindata = async () => {
        setloader(true);
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentaccount(account);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
            var i;
            const medCtr = await supplychain.methods.medicineCtr().call();
            const med = {};
            const medStage = [];
            for (i = 0; i < medCtr; i++) {
                med[i + 1] = await supplychain.methods.MedicineStock(i + 1).call();
                medStage[i + 1] = await supplychain.methods.showStage(i + 1).call();
            }
            setMED(med);
            setMedStage(medStage)
            
            setloader(false);
        } else {
            window.alert('The smart contract is not deployed to current network')
        }
    }

    useEffect(() => {
            loadWeb3();
            loadBlockchaindata();
    }, [])

    if (loader) {
        return (
            <div>
                <h1 className="wait">Loading...</h1>
            </div>
        )
    }

    const handlerChangeID = (event) => {
        setID(event.target.value);
    }

    const url = "http://localhost:3000/call-function?id="+ID
    console.log(url)

    // function printsomething() {
    //     console.log("yoooooo")
    // }

    if(showdata) {
        return (
            <div style={{margin:"15px"}}>
                <div className="header-container" >
                    <span><b>Current Account Address:</b> {currentaccount}</span>
                    <span onClick={() => history.push('/')} className="btn btn-outline-danger btn-sm home-button">HOME</span>
                </div>
                <article className="col-4">
                    <h3><b><u>Product:</u></b></h3>
                    <span><b>Product ID: </b>{MED[ID].id}</span>
                    <br />
                    <span><b>Name:</b> {MED[ID].name}</span>
                    <br />
                    <span><b>Description: </b>{MED[ID].description}</span>
                    <br />
                    <span><b>Quantity: </b>{MED[ID].quantity}</span>
                    <br />
                    <span><b>Current stage: </b>{MedStage[ID]}</span>
                </article>
                <div id="qrdiv"></div>
                <QRCodeCanvas value={url} marginSize={4}/>
            </div>
        )
    }
    
    function handlerSubmit() {
        console.log(MED)
        setshowdata(true)
    } 

    return (
        <div style={{margin: "15px"}}>
            <div className="header-container">
                <span><b>Current Account Address:</b> {currentaccount}</span>
                <span onClick={() => history.push('/')} className="btn btn-outline-danger btn-sm home-button">HOME</span>
            </div>
            <form onSubmit={handlerSubmit}>
                <h5>Enter Product ID to generate QR</h5>
                <input className="form-control-sm" type="text" onChange={handlerChangeID} placeholder="Enter Battery ID" required />
                <button className="btn btn-outline-success btn-sm" >Generate</button>
            </form>
        </div>
        
    )
}