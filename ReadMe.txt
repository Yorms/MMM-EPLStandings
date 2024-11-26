1. Get an API Key

    Go to Football-Data.org.
    Sign up for an account.
    Obtain your free API key from the "My Account" section.

2. API Documentation

The endpoint to get the league standings for the EPL is:

https://api.football-data.org/v4/competitions/PL/standings

    Method: GET
    Headers:

    {
      "X-Auth-Token": "YOUR_API_KEY"
    }

3. Update the MagicMirror² Module

Modify the module to use the Football-Data.org API.
File: MMM-EPLStandings.js

Module.register("MMM-EPLStandings", {
    defaults: {
        apiKey: "YOUR_API_KEY",       // Replace with your Football-Data.org API key
        maxTeams: 14,                // Number of teams to display
        updateInterval: 60 * 60 * 1000 // Update every hour
    },

    start: function () {
        this.standings = null;
        this.getData();
        setInterval(() => {
            this.getData();
        }, this.config.updateInterval);
    },

    getData: function () {
        this.sendSocketNotification("GET_EPL_STANDINGS", {
            apiKey: this.config.apiKey,
            maxTeams: this.config.maxTeams
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "EPL_STANDINGS_RESULT") {
            this.standings = payload;
            this.updateDom();
        }
    },

    getDom: function () {
        const wrapper = document.createElement("div");

        if (!this.standings) {
            wrapper.innerHTML = "Loading standings...";
            return wrapper;
        }

        const table = document.createElement("table");
        table.className = "small";

        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `<th>#</th><th>Team</th><th>Points</th>`;
        table.appendChild(headerRow);

        this.standings.forEach((team, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.points}</td>
            `;
            table.appendChild(row);
        });

        wrapper.appendChild(table);
        return wrapper;
    }
});

File: node_helper.js

This script fetches the standings from Football-Data.org.

const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_EPL_STANDINGS") {
            this.getStandings(payload.apiKey, payload.maxTeams);
        }
    },

    async getStandings(apiKey, maxTeams) {
        try {
            const url = "https://api.football-data.org/v4/competitions/PL/standings";
            const response = await axios.get(url, {
                headers: { "X-Auth-Token": apiKey }
            });

            const standings = response.data.standings[0].table
                .slice(0, maxTeams) // Get top teams
                .map(team => ({
                    name: team.team.name,
                    points: team.points
                }));

            this.sendSocketNotification("EPL_STANDINGS_RESULT", standings);
        } catch (error) {
            console.error("Error fetching EPL standings:", error);
        }
    }
});

File: MMM-EPLStandings.css

Style the table for a clean look.

.MMM-EPLStandings table {
    width: 100%;
    border-collapse: collapse;
}

.MMM-EPLStandings th,
.MMM-EPLStandings td {
    padding: 5px;
    text-align: left;
}

.MMM-EPLStandings th {
    font-weight: bold;
    border-bottom: 1px solid #fff;
}

4. Add Module to config.js

Include the module in your MagicMirror² configuration file:

modules: [
    {
        module: "MMM-EPLStandings",
        position: "top_left", // You can choose any position
        config: {
            apiKey: "YOUR_API_KEY", // Replace with your Football-Data.org API key
            maxTeams: 14           // Number of teams to display
        }
    }
]

5. Restart MagicMirror

To see the changes, restart MagicMirror:

npm start

6. Test the Module

    Ensure your API key is valid and you don’t exceed the API rate limit.
    Use the browser console (Ctrl+Shift+I) or pm2 logs mm to debug any issues.
