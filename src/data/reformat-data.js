const playerData = require('./output.json')
const playerArr = require('./player-data2.json');

const createSetOfSeasons = player => {
    const teams = player.teams.map(team => {
        if (team.team_id === 'TOT') return '';

        return `${team.league_id}-${team.team_id}-${team.season_year}`;
    })

    return new Set(teams.filter(team => team.length > 0));
}

const formatPlayerObj = player => {
    return {
        career_start: player.career_start,
        career_end: player.career_end,
        position: player.position,
        height: player.height,
        weight: player.weight,
        birth_date: player.birth_date,
        colleges: player.colleges,
        name: player.name,
        bref_id: player.bref_id,
        bref_letter: player.bref_letter,
        teams: createSetOfSeasons(player)
    }
};

const formattedPlayers = playerData.map(player => formatPlayerObj(player));

const findTeammates = (playerToCompare, allPlayers) => {
    return allPlayers
        .reduce((arr, player) => {
            if([...player.teams].filter(team => playerToCompare.teams.has(team)).length) arr.push(player)
            return arr
        }, [])
        .map(player => player.bref_id)
}

const playersWithTeammates = formattedPlayers
    .map(player => ({...player, teammates: findTeammates(player, formattedPlayers)}))
    .map(player => ({...player, teams: Array.from(player.teams)}));

const playersObj = playersWithTeammates.reduce((obj, individualPlayer) => {
    obj[individualPlayer.bref_id] = individualPlayer
    return obj
}, {})

const addHOFStatus = playerInfo => {
    return playerInfo.map(player => ({...player, isHOFer: player.name.includes('*')}))
}

const filterSelfOutTeammatesArr = players => {
    return players.map(player => {
        return ({...player, teammates: player.teammates.filter(filterPlayer => filterPlayer !== player.bref_id)})
    })
}

console.log(JSON.stringify(filterSelfOutTeammatesArr(playerArr)))
