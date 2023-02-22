const accessToken = document.querySelector('#accessToken');
const dwnBtn = document.querySelector('#dwn-btn');
const errorDiv = document.querySelector('#error');
const loadingDiv = document.querySelector('#loading');
const loginForm = document.querySelector('#loginForm');
const serverUrl = document.querySelector('#serverUrl');
const table = document.querySelector('#rooms');

let csvContent;

window.onload = function () {
    document.querySelector('#current-url').textContent = window.location.host;
    csvContent = '';
    dwnBtn.disabled = true;
};

function downloadAsTextFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Start file download.
dwnBtn.addEventListener(
    'click',
    function () {
        const text = csvContent;
        const filename = 'rooms.csv';

        downloadAsTextFile(filename, text);
    },
    false,
);

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
    dwnBtn.disabled = true;
    error.textContent = '';

    const rooms = await getRooms();

    csvContent = 'roomID;roomName;creator;canonicalAlias;public;memberCount\n';

    if (!rooms.error) {
        rooms.forEach((room) => {
            if (room.joined_members > 2) {
                createRow(room);
                csvContent += `${room.room_id};${room.name?.replace(';', ':')};${room.creator};${
                    room.canonical_alias
                };${room.public};${room.joined_members}\n`;
            }
        });
    }

    dwnBtn.disabled = false;
    loadingDiv.hidden = true;
});
