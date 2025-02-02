"use strict";
/* Installed dependecies:
    npm i express
    npm i nodemon
    npm install -g typescript
    npm install --save-dev typescript
    tsc --init  -> Generated tsconfig.json file
    npm install --save-dev @types/express  -> Installs the remaining depednicies for typescript on express
    npm install mongoose dotenv -> For mongodb
    touch .env -> Created .env file
    npm install --save-dev ts-node  -> Very Very important , to run npm start
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = __importStar(require("body-parser")); //  imports all exports from the body-parser module and assigns them to the bodyParser object.
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const tokenDetails_controller_1 = require("./controllers/tokenDetails.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(bodyParser.json()); // Adds the bodyParser middleware
const port = 8000;
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase'; /* process.env is a global object
containing all environment variables */
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
// Root route
app.get('/', (req, res) => {
    res.send("Hello from Darshit's Server");
});
// Add a commitment to the leaves array
app.post('/addLeaf', tokenDetails_controller_1.addLeaf); // Use the addLeaf controller function
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
// Note: If we remove bodyParser , the req.body becomes undefined .
// Starts the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
//# sourceMappingURL=index.js.map