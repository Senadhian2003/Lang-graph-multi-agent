import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";

const { Pool } = pg;

// export const pool = new Pool({
//     connectionString: "postgresql://postgres:Sena@2003@localhost:5434/lang-graph"
//   });

export const pool = new Pool({

 user: 'postgres',
  host: 'localhost',
  database: 'personal-assistant',
  password: 'Sena@2003',
  port: 5432,

});



