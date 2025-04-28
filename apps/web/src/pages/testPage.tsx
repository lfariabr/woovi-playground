import { useState, useEffect } from 'react';


const test = () => {
    const name = 'Luis'
    const balance = 1000
    const [con, setCon] = useState(0);
 	const incrementCount = () => {
 		setCon(con + 1);
 		console.log('con: '+con);
 	}
 
 	return (
 		<main>
 			<h1>Test Page</h1>
            <h5>Name: {name}</h5>
 			<h5>Balance: R$ {balance}</h5>
 			
 			<button onClick={incrementCount}>Create Transaction</button>
 
 
 			<div> 
 				<p>
 					Transaction History:
 				</p>
 			</div>
 		</main>
 	)
 }

export default test
