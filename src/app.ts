import express, { type Application, type Express, type Request, type Response } from 'express';
import { authRoute } from './module/auth/auth.route';
import { userRoute } from './module/user/user.route';

const app: Application = express();
app.use(express.json())

app.use("/api/v1/auth",authRoute)
app.use("/api/v1/users", userRoute)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

export default app