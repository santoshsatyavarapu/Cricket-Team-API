const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//GET PLAYERS

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      *
    FROM 
    cricket_team
    ORDER BY player_id`;
  const playersArray = await db.all(getPlayersQuery);
  const finalArray = [];
  for (let each of playersArray) {
    const new_object = convertDbObjectToResponseObject(each);
    finalArray.push(new_object);
  }
  response.send(finalArray);
});

//GET PLAYER ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayersDetails = `
    SELECT 
      *
    FROM 
    cricket_team
    WHERE player_id= ${playerId}`;

  const playerDetails = await db.get(getPlayersDetails);
  const result = convertDbObjectToResponseObject(playerDetails);
  response.send(result);
});

//POST PLAYER

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  let player_name = playerName;
  let jersey_number = jerseyNumber;

  const addPlayerDetails = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${player_name}',
         ${jersey_number},
        '${role}'
      );`;

  const dbResponse = await db.run(addPlayerDetails);

  response.send("Player Added to Team");
});

//PUT PLAYER
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  let player_name = playerName;
  let jersey_number = jerseyNumber;

  const updatePlayerDetails = `
    UPDATE
      cricket_team
    SET
       player_name='${player_name}',
       jersey_number=${jersey_number},
       role='${role}'
    WHERE
       player_id=${playerId};`;

  const dbResponse = await db.run(updatePlayerDetails);

  response.send("Player Details Updated");
});

//DELETE DETAILS

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
