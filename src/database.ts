import { Client } from 'pg'

const client = await new Client("postgresql://neondb_owner:npg_Q6mT2wgCPUtv@ep-young-cake-ayoll72b.c-5.us-east-2.aws.neon.tech/neondb?sslmode=verify-full").connect()


// const res = await client.query('SELECT $1::text as message', ['Hello world!'])
// console.log(res.rows[0].message) // Hello world!
// await client.end()


export const loginDb = async (email: string, password: string) =>{
    console.log("This is the email passed by the function",email);
    // connect to database
    //run query to check if user exists with the given email 
    const res = await client.query("SELECT * FROM users WHERE email = 'edem@example.com'")
    //if user does not exist, return error message
    
    // if user exists, check if password matches
    console.log(res.rows);
}
export default client