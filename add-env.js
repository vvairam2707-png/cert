const { spawnSync } = require('child_process');

function addEnv(name, env, value) {
    const process = spawnSync('vercel', ['env', 'add', name, env], {
        input: value + '\n',
        shell: true,
        stdio: ['pipe', 'inherit', 'inherit']
    });
    console.log(`Added ${name} to ${env}: `, process.status);
}

const envs = ['production', 'preview', 'development'];
for (const env of envs) {
    addEnv('MONGO_URI', env, 'mongodb+srv://savithiranm33_db_user:vairam@cluster0.vpaexdg.mongodb.net/certdb');
    addEnv('JWT_SECRET', env, 'cert_super_secret_key_2024');
}
