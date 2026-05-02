import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "./index.js";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${config.database.url}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
