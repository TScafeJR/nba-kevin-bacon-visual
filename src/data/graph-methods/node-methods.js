const getAllNodes = input => {
    return input.map((player, index) => {
        return {
            id: player.bref_id,
            label: player.name.replace('*', ''),
            // id: index
        }
    });
};

module.exports = {
    getAllNodes
}
