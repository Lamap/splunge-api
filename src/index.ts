import { Request, Response} from 'express';
import express = require("express");
import routes from "./routes";
const app = express();

const getBela = (req: Request, res: Response) => {
    console.log(req.query);
    return res.status(200).json({bela: 3223, param: req.params.id});
}
app.get('/bela/:id', getBela);
app.use(routes);

const PORT: any = process.env.PORT ?? 1111;
app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
