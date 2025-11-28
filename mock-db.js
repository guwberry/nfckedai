const MOCK_DATA_KEY = 'nfcRepairRecords';

const seedRepairs = [
    {
        nfcId: 'A10001',
        customerName: 'John Doe',
        model: 'iPhone 13 Pro',
        issue: 'Cracked screen',
        status: 'In Progress',
        costEstimate: 320,
        amountPaid: 150,
        technicianNotes: 'Waiting on OEM glass.',
        lastUpdated: '2025-11-27T10:00:00Z'
    },
    {
        nfcId: 'A10002',
        customerName: 'Maria Lopez',
        model: 'Galaxy S23 Ultra',
        issue: 'Water damage',
        status: 'Checked-In',
        costEstimate: 450,
        amountPaid: 0,
        technicianNotes: 'Diagnostics running.',
        lastUpdated: '2025-11-26T15:30:00Z'
    },
    {
        nfcId: 'A10003',
        customerName: 'Ethan Park',
        model: 'Pixel 8',
        issue: 'Battery swelling',
        status: 'Ready for Pickup',
        costEstimate: 189,
        amountPaid: 189,
        technicianNotes: 'Battery replaced. QA passed.',
        lastUpdated: '2025-11-25T09:45:00Z'
    },
    {
        nfcId: 'A10004',
        customerName: 'Sara Miles',
        model: 'iPad Air 5',
        issue: 'Charging port faulty',
        status: 'Completed',
        costEstimate: 260,
        amountPaid: 130,
        technicianNotes: 'Awaiting remaining balance.',
        lastUpdated: '2025-11-24T18:05:00Z'
    }
];

function getStoredRepairs() {
    const raw = localStorage.getItem(MOCK_DATA_KEY);
    if(!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn('Invalid mock DB payload. Resetting.', err);
        return [];
    }
}

function persistRepairs(records) {
    localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(records));
}

(function initMockData() {
    if(getStoredRepairs().length === 0) {
        persistRepairs(seedRepairs);
    }
})();

function upsertRepair(record) {
    const records = getStoredRepairs();
    const idx = records.findIndex(r => r.nfcId === record.nfcId);
    if(idx >= 0) {
        records[idx] = { ...records[idx], ...record, lastUpdated: new Date().toISOString() };
    } else {
        records.push({ ...record, lastUpdated: new Date().toISOString() });
    }
    persistRepairs(records);
    return record;
}

function findRepairByUid(uid) {
    return getStoredRepairs().find(r => r.nfcId === uid);
}

window.mockDb = {
    upsertRepair,
    findRepairByUid,
    getAll: getStoredRepairs
};

