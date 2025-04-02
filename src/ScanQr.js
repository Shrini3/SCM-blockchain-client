import {Html5QrcodeScanner} from "html5-qrcode";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

export default function ScanQR() {
    const[scanResult, setScanResult] = useState(null)
    const history = useHistory()

    useEffect(()=> {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: {width: 300, height: 300} },
            /* verbose= */ false);

        scanner.render(success, error)

        function success(res) {
            scanner.clear()
            setScanResult(res)
        }

        function error(err) {
            console.warn(err)
        }

    }, [])

    return (
        <>
            <div className="header-container" style={{margin:"15px"}}>
                <span onClick={() => history.push('/')} className="btn btn-outline-danger btn-sm home-button">HOME</span>
            </div>
            <h1 style={{marginLeft: "10px"}}>QR Code Scanner</h1>
            {
                scanResult
                ? <p style={{marginLeft: "20px"}}><a href={scanResult}> Go</a></p>
                : <div maxHeight="400px" maxWidth="400px">
                    <div id="reader" maxWidth="400" maxHeight="400"></div>

                    </div>
            }
        </>
    )
}