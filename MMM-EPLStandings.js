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
