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
