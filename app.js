import express from "express"
import path from "path";

const __dirname = path.resolve()
const app = express();
const port = 8080;

app.use(express.static(path.resolve(__dirname, "static")))


app.listen(process.env.PORT || port, () => {
    console.log(`http://localhost:${port}`)
});