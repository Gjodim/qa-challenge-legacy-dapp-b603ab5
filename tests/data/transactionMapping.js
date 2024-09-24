// transactionMapping.js
module.exports = {
    MINT: 'Mint <amount> <symbol>',
    PAYMENT: 'Pay <user> <amount> <symbol>',
    TRANSFER: 'Move <amount> <symbol> from <team> to <team>',
    REPUTATION: 'Awarded <user> with a <amount> points reputation award',
    PERMISSIONS: 'Assign the <comma-separated-roles> permissions in <team> to <user>',
    UPGRADE: 'Upgrade to version <version>',
    DETAILS: 'Details changed',
    ADDRESS: 'Address book was updated',
    TEAM: 'New team: <team>',
    GENERIC: 'Generic Action',
};
