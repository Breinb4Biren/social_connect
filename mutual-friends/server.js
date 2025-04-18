import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './src/routes/users.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});