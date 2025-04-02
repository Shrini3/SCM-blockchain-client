import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import Web3 from "web3";
//import SupplyChainABI from "./artifacts/SupplyChain.json"
import {abi, contract_address} from "./contractConfig"

function AddMed() {
    const history = useHistory()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [MED, setMED] = useState({});
    const [MedData, setMedData] = useState({
        name: "",
        desc: "",
        qty: "",
        recieverId: 0,
        senderId: "",
        stage: ""
    });
    //const [MedDes, setMedDes] = useState("");
    const [MedStage, setMedStage] = useState();
    const [id, setid] = useState()

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
        //const networkId = await web3.eth.net.getId();
        //const networkData = SupplyChainABI.networks[networkId];
        if (/*networkData*/ contract_address) {
            //const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            const supplychain = new web3.eth.Contract(abi, contract_address);
            setSupplyChain(supplychain);
            const medCtr = await supplychain.methods.medicineCtr().call();
            const med = {};
            const medStage = [];
            for (let i = 0; i < medCtr; i++) {
                med[i] = await supplychain.methods.MedicineStock(i + 1).call();
                medStage[i] = await supplychain.methods.showStage(i + 1).call();
            }
            setMED(med);
            setMedStage(medStage);
            setloader(false);
        } else {
            window.alert('The smart contract is not deployed to current network');
        }
    }

    if (loader) {
        return (
            <div style={styles.container}>
                <h1 className="wait">Loading...</h1>
            </div>
        )
    }

    const redirect_to_home = () => {
        history.push('/')
    }

    // const handlerChangeNameMED = (event) => {
    //     setMedName(event.target.value);
    // }

    // const handlerChangeDesMED = (event) => {
    //     setMedDes(event.target.value);
    // }

    const handleInputChange = async (event) => {
        const { name, value, type } = event.target;
        const newValue = type === 'number' ? Number(value) : value;
        setMedData((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));
        console.log(name + " " + value)
    };

    const handlerSubmitMED = async (event) => {
        
        event.preventDefault();
        try {
            let flag = false
            let stageNo = 0;
            if(!flag) {
                const v = await SupplyChain.methods.findRMS(currentaccount).call()
                console.log(v)
                console.log("rms")
                if(v > 0) {
                    setid(v)
                    stageNo = 1
                    flag = true
                }
            } 
            if(!flag) {
                const v = await SupplyChain.methods.findMAN(currentaccount).call();
                console.log(v)
                console.log("man")
                if(v > 0) {
                    setid(v)
                    stageNo = 2
                    flag = true
                }
            }
            if(!flag) {
                const v = await SupplyChain.methods.findDIS(currentaccount).call();
                console.log("dis")
                if(v > 0) {
                    console.log("done")
                    setid(v)
                    stageNo = 3
                    flag = true
                }
            } 
            setTimeout(() => {
                console.log(MedData)
                console.log(id.toString() + " " + stageNo)
                let reciept
                if(flag && id > 0) {
                    reciept = SupplyChain.methods.addMedicine(
                        MedData.name,
                        MedData.desc,
                        MedData.qty,
                        MedData.recieverId,
                        id,
                        stageNo
                    ).send({ from: currentaccount });
                }
    
                if (reciept) {
                    loadBlockchaindata();
                }
            }, 4000)
        } catch (err) {
            console.log(err)
            alert("An error occurred!!!");
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.header}>
                    <span><b>Current Account Address:</b> {currentaccount}</span>
                    <span onClick={redirect_to_home} className="btn btn-outline-danger btn-sm" style={styles.homeButton}>HOME</span>
                </div>
                <br />
                <h5>Add Order:</h5>
                <form onSubmit={handlerSubmitMED} style={styles.form}>
                    <input className="form-control-sm" type="text" onChange={handleInputChange} name="name" value={MedData.name} placeholder="Product Name" required />
                    <input className="form-control-sm" type="text" onChange={handleInputChange} name="desc" value={MedData.desc} placeholder="Product Description" required />
                    <input className="form-control-sm" type="text" onChange={handleInputChange} name="qty" value={MedData.qty} placeholder="Quantity" required />
                    <input className="form-control-sm" type="number" onChange={handleInputChange} name="recieverId" value={MedData.recieverId} placeholder="Reciever ID" required />
                    <button className="btn btn-outline-success btn-sm" style={styles.submitButton}>Order</button>
                </form>
                <br />
                <h5>Ordered Items:</h5>
                <table className="table table-bordered" style={styles.table}>
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Description</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Current Stage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(MED).map((key) => (
                            <tr key={key}>
                                <td>{MED[key].id}</td>
                                <td>{MED[key].name}</td>
                                <td>{MED[key].description}</td>
                                <td>{MED[key].quantity}</td>
                                <td>{MedStage[key]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f4c3 30%, #c5e1a5 90%)', // Background gradient
        padding: '20px'
    },
    content: {
        backgroundColor: '#ffffffcc', // Slightly transparent white background
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
        maxWidth: '700px',
        width: '100%',
        textAlign: 'center'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    homeButton: {
        marginLeft: 'auto',
        cursor: 'pointer'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '20px'
    },
    submitButton: {
        marginTop: '10px'
    },
    table: {
        marginTop: '20px'
    }
}

export default AddMed
