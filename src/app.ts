import express, { type Express, type Request, type Response } from 'express';
import { loginDb } from './database.ts';
import router from './routes/auth.ts';
const app: Express = express();
const users = [
  { id: 1, email: 'john@example.com', password: 'secret', name: 'John Doe' },
  { id: 2, email: 'jane@example.com', password: 'secret', name: 'Jane Smith' },
  { id: 3, email: 'alice@example.com', password: 'secret', name: 'Alice Johnson' },
];

app.use(express.json()); 

// 2. For parsing application/x-www-form-urlencoded (Standard HTML form submissions)
app.use(express.urlencoded({ extended: true })); 
app.use(router);
app.post('/loginpage', (req: Request, res: Response) => {
const email = req.body.email;
const password = req.body.password;

  loginDb(email, password);
  // if (!email || !password) {
  //   return res.status(400).json({ message: 'Email and password are required' });
  // }
  // const user = users.find(u => u.email === email && u.password === password);
  // if (!user) {
  //   return res.status(401).json({ message: 'Invalid email or password' });
  // }
  return res.status(200).json({ message: 'Login successful' });
});
app.get('/users', (req: Request, res: Response) => {
  res.send('Hello Users!');
});
app.get('/receptionists', (req: Request, res: Response) => {
  res.send('WELCOME RECEPTIONISTS!');
});
app.listen(3000);
console.log('Server is running on port 3000');