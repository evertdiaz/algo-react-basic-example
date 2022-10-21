import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

import { Accounts } from '@randlabs/myalgo-connect';
import algosdk from 'algosdk'
import { algodClient, connection, indexerClient } from './utils/connection'
import { Button, Col, Container, Label, Row } from 'reactstrap';

function App() {
  const [params, setParams] = useState();
  const [accounts, setAccounts] = useState([]);
  const [appId, setAppId] = useState(113498668);
  const [studentAddress, setStudentAddres] = useState("VLPUJQ6XOMEPMIGPQVBB5D6RKDSU2EX5BB4Y7QLQR7X44JZRBCLJ52FBL4")
  const [visibleOptions, setVisibleOptions] = useState(false);
  const [tempResponse, setTempResponse] = useState("");


  // Connection 
  const onCompleteConnect = (accounts) => {
    setAccounts(accounts)
  }
  const connectToMyAlgo = async () => {
    const accounts = await connection.connect();
    setAccounts(accounts);
    onCompleteConnect(accounts);
  }
  
  const onClearResponse = () => {
    setAccounts([]);
  }

  // General
  const getTxParams = async () => {
    const params = await algodClient.getTransactionParams().do()
    setParams(params)
  }

  useEffect(() => {
    getTxParams()
    console.log(accounts)
    if (accounts.length>0) setVisibleOptions(true)
    else setVisibleOptions(false)
  }, [accounts])

  // Opt in
  const optinApp = async (event) => {
    event.preventDefault();
    if (!params || accounts.length === 0) return;

    const txn = algosdk.makeApplicationOptInTxnFromObject({
      suggestedParams: {
        ...params,
        fee: 1000,
        flatFee: true,
      },
        from: accounts[0].address,
        appIndex: appId
    });

    const signedTxn = await connection.signTransaction(txn.toByte());
    const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

    setTempResponse(response);
  }

  // Register diploma
  const registerDiploma = async (event) => {
    event.preventDefault();
    if (!params || accounts.length === 0) return;
    
    const appArgs = []
    appArgs.push(
      new Uint8Array(Buffer.from("register_diploma")),
      new Uint8Array(Buffer.from("diploma_for_bootcamp"))
    )
    console.log(appArgs)
    
    const txn = algosdk.makeApplicationCallTxnFromObject({
      appArgs,
      appIndex: appId,
      from: accounts[0].address,
      suggestedParams: params,
      onComplete: 0,
      accounts: [studentAddress]
    })

    const signedTxn = await connection.signTransaction(txn.toByte());
    const response = await algodClient.sendRawTransaction(signedTxn.blob).do();

    console.log(response)
    setTempResponse(response);
  }

  // Review Local State
  const checkLocalState = async(event) => {
    event.preventDefault();
    if (!params || accounts.length === 0) return;

    const accountApplications = await indexerClient
      .lookupAccountAppLocalStates(accounts[0].address)
      .applicationID(appId)
      .do();
    let accountHasDiploma = false
    if (accountApplications['apps-local-states'].length > 0) {
      accountHasDiploma = true
    }
    console.log(accountHasDiploma?'Student has a diploma':'Student doesnt have registered diploma to claim')
  }
  

  return (
    <div className="App">
      <div className='main' style={{marginTop:'10vh'}}>
        
        {/* Connect and disconnect */}
        <Container>
          <Row>
            <h1>Connects</h1>
            <p>Connect to My Algo</p>
            <Button
              className="button-margin"
              color="primary"
              block
              onClick={connectToMyAlgo}>
              Connect
            </Button>
            <Button
              className="button-margin"
              color="primary"
              block
              disabled={!accounts.length}
              onClick={onClearResponse}>
              Clear
            </Button>
          </Row>
          <p>Cuenta: {accounts[0]?.address}</p>
        </Container>

        {/* Opt In */}
        {!accounts.length ? null :
          <Container>
          <h2>Opt in application</h2>
          <Button
            className="button-margin"
            color="primary"
            block
            onClick={optinApp}>
            Opt in
          </Button>
        </Container>
        }

        {/* Application call */}
        {!accounts.length ? null :
          <Container>
          <h2>Register diploma</h2>
          <Button
            className="button-margin"
            color="primary"
            block
            onClick={registerDiploma}>
            Register Diploma
          </Button>
        </Container>
        }

        {/* Check local state */}
        {!accounts.length ? null :
          <Container>
          <h2>See Registered diploma</h2>
          <Button
            className="button-margin"
            color="primary"
            block
            onClick={checkLocalState}>
            Check
          </Button>
        </Container>
        }
        
      </div>
    </div>
  );
}

export default App;
