require("dotenv").config();

console.log("MONGO_URI VALUE:");
console.log(process.env.MONGO_URI);

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});