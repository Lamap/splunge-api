import express = require('express');
import routes from './routes';
import { errorHandler } from './middlewares/Errorhandler';
const app = express();

app.use(routes);
app.use(errorHandler)
const PORT: any = process.env.PORT ?? 1111;
app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
