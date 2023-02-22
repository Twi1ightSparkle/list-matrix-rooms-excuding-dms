const accessToken = document.querySelector('#accessToken');
const loginForm = document.querySelector('#loginForm');
const errorDiv = document.querySelector('#error');
const loadingDiv = document.querySelector('#loading');
const serverUrl = document.querySelector('#serverUrl');
const table = document.querySelector('#rooms');

window.onload = function () {
    document.querySelector('#current-url').textContent = window.location.host;
};

async function getRooms() {
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `https://${serverUrl.value}/_synapse/admin/v1/rooms?limit=2000000`;

    let res;
    try {
        res = await fetch(url, {
            method: 'GET',
            headers,
        });
    } catch (error) {
        errorDiv.textContent = error;
        return { error: true };
    }

    if (res.status !== 200) {
        errorDiv.textContent = res.statusText;
        return { error: true };
    }

    const response = await res.json();
    return response.rooms;
}

function createRow(room) {
    console.log(room);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td className="roomId">
            <div className="text-wrap fs-4 text">
                ${room.room_id.replace(':', ' :')}
            </div>
        </td>
        <td className="roomName">
            <div className="text-wrap fs-4 text">
                ${room.name || 'not set'}
            </div>
        </td>
        <td className="creator">
            <div className="text-wrap fs-4 text">
                ${room.creator || 'Unable to determine creator'}
            </div>
        </td>
        <td className="alias">
            <div className="text-wrap fs-4 text">
                ${room.canonical_alias || 'not set'}
            </div>
        </td>
        <td className="public">
            <div className="text-wrap fs-4 text">
                ${room.public ? 'Yes' : 'No'}
            </div>
        </td>
        <td className="members">
            <div className="text-wrap fs-4 text">
                ${room.joined_members}
            </div>
        </td>
    `;
    table.appendChild(row);
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    loadingDiv.hidden = false;
    error.textContent = '';

    const rooms = await getRooms();

    if (!rooms.error) {
        rooms.forEach((room) => {
            if (room.joined_members > 2) createRow(room);
        });
    }

    loadingDiv.hidden = true;
});
