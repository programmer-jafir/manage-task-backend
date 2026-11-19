import express, { type Application, type Express, type Request, type Response } from 'express';
import { authRoute } from './module/auth/auth.route';

const app: Application = express();
app.use(express.json())

app.use("/api/v1/auth",authRoute)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

export default app