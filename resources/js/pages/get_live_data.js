import React, { useState, useEffect } from 'react';
import { useBarcode } from 'react-barcodes';
import axios from "axios";
const gitHubUrl = "http://localhost:3000/api/v1/ex/all";
// const gitHubUrl = "https://4jsbuilders-sips.com/api/v1/ex/all";
function App(props) {
  const [userData, setUserData] = useState({});

  // useEffect(() => {
  //     getGiHubUserWithAxios();
  //   }, []);

  const getGiHubUserWithAxios = async () => {
    const response = await axios.post(gitHubUrl);
    // setUserData(response.data);
    console.log("external")
    console.log(response.data.suppliers)
  };

  return (

    <div style={{margin: '10px'}}>
      <button onClick={getGiHubUserWithAxios} class="ui button">Update Data</button>
    </div>


  )

};


export default App;
