const bcrypt = require('bcrypt');
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node generate-hash.js <password>');
    process.exit(1);
}

const password = args[0];
const hash = bcrypt.hashSync(password, 10);

console.log('---------------------------------------------------');
console.log('Password:', password);
console.log('Bcrypt Hash:', hash);
console.log('---------------------------------------------------');
console.log('Copy the hash above and paste it into your .env file');
console.log('as ADMIN_PASSWORD_HASH=...');
console.log('---------------------------------------------------');
